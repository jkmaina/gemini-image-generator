import { ImageMetadata, ImageOptions } from './types';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Create images directory if it doesn't exist
const imagesDir = path.join(process.cwd(), "public", "generated-images");
const metadataDir = path.join(process.cwd(), "data", "metadata");

// Initialize directories
export async function initDirectories() {
  try {
    await fs.mkdir(imagesDir, { recursive: true });
    await fs.mkdir(metadataDir, { recursive: true });
  } catch (error) {
    console.error('Error initializing directories:', error);
  }
}

// Save image to disk and return metadata
export async function saveImage(
  imageData: string,
  prompt: string,
  mimeType: string = "image/png",
  options: ImageOptions = {}
): Promise<ImageMetadata> {
  // Generate a unique ID
  const id = crypto.randomUUID();
  
  // Generate a unique filename
  const hash = crypto.createHash('md5').update(prompt + Date.now().toString()).digest('hex');
  const extension = mimeType.split('/')[1];
  const filename = `${hash}.${extension}`;
  const filePath = path.join(imagesDir, filename);
  
  // Save the image to disk
  const buffer = Buffer.from(imageData, 'base64');
  await fs.writeFile(filePath, buffer);
  
  // Create image metadata
  const metadata: ImageMetadata = {
    id,
    prompt,
    createdAt: new Date().toISOString(),
    filename,
    mimeType,
    size: buffer.length,
    url: `/generated-images/${filename}`
  };
  
  // Save metadata to disk
  const metadataPath = path.join(metadataDir, `${id}.json`);
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  
  return metadata;
}

// Function to fetch image data from URL
export async function fetchImageFromUrl(url: string): Promise<{ data: string; mimeType: string }> {
  try {
    // Handle local URLs (from our own server)
    if (url.startsWith('/')) {
      const publicDir = path.join(process.cwd(), 'public');
      const filePath = path.join(publicDir, url.replace(/^\//, ''));
      
      const exists = await fs.stat(filePath).catch(() => false);
      if (!exists) {
        throw new Error(`File not found: ${filePath}`);
      }
      
      const buffer = await fs.readFile(filePath);
      const base64Data = buffer.toString('base64');
      
      // Determine mime type from file extension
      const extension = path.extname(filePath).toLowerCase();
      let mimeType = 'image/jpeg'; // default
      
      if (extension === '.png') {
        mimeType = 'image/png';
      } else if (extension === '.webp') {
        mimeType = 'image/webp';
      } else if (extension === '.gif') {
        mimeType = 'image/gif';
      }
      
      return {
        data: base64Data,
        mimeType
      };
    }
    
    // Handle external URLs
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');
    const mimeType = response.headers.get('content-type') || 'image/jpeg';
    
    return {
      data: base64Data,
      mimeType
    };
  } catch (error) {
    console.error('Error fetching image:', error);
    throw error;
  }
}

// Get image metadata by ID
export async function getImageMetadata(id: string): Promise<ImageMetadata | null> {
  try {
    const metadataPath = path.join(metadataDir, `${id}.json`);
    
    const exists = await fs.stat(metadataPath).catch(() => false);
    if (!exists) {
      return null;
    }
    
    const data = await fs.readFile(metadataPath, 'utf8');
    return JSON.parse(data) as ImageMetadata;
  } catch (error) {
    console.error('Error reading image metadata:', error);
    return null;
  }
}

// List all image metadata
export async function listImageMetadata(limit: number = 100, offset: number = 0): Promise<ImageMetadata[]> {
  try {
    const files = await fs.readdir(metadataDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    // Get file stats for sorting
    const filesWithStats = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(metadataDir, file);
        const stats = await fs.stat(filePath);
        return { file, mtime: stats.mtime };
      })
    );
    
    // Sort by creation time (newest first)
    filesWithStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
    
    // Apply pagination
    const paginatedFiles = filesWithStats
      .slice(offset, offset + limit)
      .map(({ file }) => file);
    
    // Read metadata for each file
    const metadataPromises = paginatedFiles.map(async (file) => {
      const data = await fs.readFile(path.join(metadataDir, file), 'utf8');
      return JSON.parse(data) as ImageMetadata;
    });
    
    return await Promise.all(metadataPromises);
  } catch (error) {
    console.error('Error listing image metadata:', error);
    return [];
  }
}

// Delete old images (older than maxAge in days)
export async function cleanupOldImages(maxAge: number = 7): Promise<number> {
  try {
    const now = Date.now();
    const maxAgeMs = maxAge * 24 * 60 * 60 * 1000;
    let deletedCount = 0;
    
    // Get all metadata files
    const files = await fs.readdir(metadataDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    for (const file of jsonFiles) {
      const metadataPath = path.join(metadataDir, file);
      const stats = await fs.stat(metadataPath);
      
      // Check if file is older than maxAge
      if (now - stats.mtime.getTime() > maxAgeMs) {
        try {
          // Read metadata to get the image filename
          const data = await fs.readFile(metadataPath, 'utf8');
          const metadata = JSON.parse(data) as ImageMetadata;
          
          // Delete the image file
          const imagePath = path.join(imagesDir, metadata.filename);
          const imageExists = await fs.stat(imagePath).catch(() => false);
          if (imageExists) {
            await fs.unlink(imagePath);
          }
          
          // Delete the metadata file
          await fs.unlink(metadataPath);
          deletedCount++;
        } catch (error) {
          console.error(`Error deleting file ${file}:`, error);
        }
      }
    }
    
    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up old images:', error);
    return 0;
  }
}