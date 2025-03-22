import { Storage } from '@google-cloud/storage';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import axios from 'axios';

// Types
export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
}

export interface ImageMetadata {
  id: string;
  prompt: string;
  createdAt: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
}

// Create metadata directory if it doesn't exist
const metadataDir = path.join(process.cwd(), "data", "metadata");
const imagesDir = path.join(process.cwd(), "data", "images");

// Initialize directories
export async function initDirectories() {
  await fs.mkdir(metadataDir, { recursive: true });
  await fs.mkdir(imagesDir, { recursive: true });
  console.log('Initialized metadata directory:', metadataDir);
  console.log('Initialized images directory:', imagesDir);
}

// Initialize Google Cloud Storage with appropriate credentials based on environment
let storage;
if (process.env.NODE_ENV === 'production') {
  // In production, use Application Default Credentials
  storage = new Storage();
  console.log('Using Application Default Credentials for GCS');
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // In development with explicit credentials
  storage = new Storage({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
  });
  console.log('Using explicit credentials from:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
} else {
  // Fallback to default credentials
  storage = new Storage();
  console.log('No explicit credentials found, using default credentials');
}

const bucketName = process.env.NODE_ENV === 'production' 
  ? (process.env.GCS_PRODUCTION_BUCKET_NAME || 'zavora-ai-generated-images')
  : (process.env.GCS_BUCKET_NAME || 'gemini-image-test-bucket');

const bucket = storage.bucket(bucketName);

console.log('Initialized Google Cloud Storage with bucket:', bucketName);

// Save image to Google Cloud Storage and return metadata
export async function saveImage(
  imageData: string,
  prompt: string,
  mimeType: string = "image/png",
  options: ImageOptions = {}
): Promise<ImageMetadata> {
  try {
    console.log('Starting saveImage function with prompt:', prompt);
    
    // Generate a unique ID
    const id = crypto.randomUUID();
    
    // Generate a unique filename
    const hash = crypto.createHash('md5').update(prompt + Date.now().toString()).digest('hex');
    const extension = mimeType.split('/')[1];
    const filename = `${hash}.${extension}`;
    
    console.log('Generated filename:', filename);
    
    // Create a buffer from the base64 image data
    const buffer = Buffer.from(imageData, 'base64');
    
    console.log('Created buffer with size:', buffer.length);
    
    // Create local directories if they don't exist (for fallback)
    const localImageDir = path.join(process.cwd(), "data", "images");
    await fs.mkdir(localImageDir, { recursive: true });
    
    // Save the image locally first (as a backup)
    const localPath = path.join(localImageDir, filename);
    await fs.writeFile(localPath, buffer);
    console.log('Image saved locally to:', localPath);
    
    // Try to upload to GCS
    let uploadedToGCS = false;
    try {
      // Upload the file directly from the local path
      await bucket.upload(localPath, {
        destination: filename,
        metadata: {
          contentType: mimeType,
          metadata: {
            prompt,
            generatedAt: new Date().toISOString(),
          }
        }
      });
      
      console.log('File uploaded successfully to GCS');
      uploadedToGCS = true;
    } catch (error) {
      console.error('Error uploading to GCS:', error);
      console.log('Using local file as fallback');
    }
    
    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
    console.log('Public URL:', publicUrl);
    
    // Create image metadata
    const metadata: ImageMetadata = {
      id,
      prompt,
      createdAt: new Date().toISOString(),
      filename,
      mimeType,
      size: buffer.length,
      url: publicUrl
    };
    
    // Save metadata to disk
    const metadataPath = path.join(metadataDir, `${id}.json`);
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    console.log('Metadata saved to:', metadataPath);
    
    return metadata;
  } catch (error) {
    console.error('Error in saveImage:', error);
    throw error;
  }
}

// Get image metadata by ID
export async function getImageMetadata(id: string): Promise<ImageMetadata | null> {
  try {
    const metadataPath = path.join(metadataDir, `${id}.json`);
    const data = await fs.readFile(metadataPath, 'utf-8');
    return JSON.parse(data) as ImageMetadata;
  } catch (error) {
    console.error(`Error getting metadata for image ${id}:`, error);
    return null;
  }
}

// List all image metadata
export async function listImageMetadata(limit: number = 100): Promise<ImageMetadata[]> {
  try {
    const files = await fs.readdir(metadataDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    // Sort by creation time (newest first)
    const metadataPromises = jsonFiles.slice(0, limit).map(async (file) => {
      const filePath = path.join(metadataDir, file);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as ImageMetadata;
    });
    
    const metadataList = await Promise.all(metadataPromises);
    return metadataList.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error listing image metadata:', error);
    return [];
  }
}

// Fetch image from URL
export async function fetchImageFromUrl(url: string): Promise<Buffer> {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
  } catch (error) {
    console.error('Error fetching image from URL:', error);
    throw error;
  }
}

// Clean up old images (keep only the most recent ones)
export async function cleanupOldImages(maxImages: number = 100): Promise<void> {
  try {
    const metadata = await listImageMetadata();
    
    if (metadata.length <= maxImages) {
      return;
    }
    
    const toDelete = metadata.slice(maxImages);
    
    for (const item of toDelete) {
      try {
        // Delete from GCS
        try {
          await bucket.file(item.filename).delete();
        } catch (error) {
          console.error(`Error deleting ${item.filename} from GCS:`, error);
        }
        
        // Delete local file
        try {
          const localPath = path.join(imagesDir, item.filename);
          await fs.unlink(localPath);
        } catch (error) {
          console.error(`Error deleting local file ${item.filename}:`, error);
        }
        
        // Delete metadata
        try {
          const metadataPath = path.join(metadataDir, `${item.id}.json`);
          await fs.unlink(metadataPath);
        } catch (error) {
          console.error(`Error deleting metadata for ${item.id}:`, error);
        }
      } catch (error) {
        console.error(`Error during cleanup for image ${item.id}:`, error);
      }
    }
    
    console.log(`Cleaned up ${toDelete.length} old images`);
  } catch (error) {
    console.error('Error during image cleanup:', error);
  }
}