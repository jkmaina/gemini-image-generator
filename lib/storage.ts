import { Storage } from '@google-cloud/storage';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

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

// Initialize directories
export async function initDirectories() {
  await fs.mkdir(metadataDir, { recursive: true });
  console.log('Initialized metadata directory:', metadataDir);
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