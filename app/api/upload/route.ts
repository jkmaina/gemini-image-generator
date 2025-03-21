import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { Storage } from '@google-cloud/storage';

// Initialize Google Cloud Storage with appropriate credentials based on environment
let storage;
if (process.env.NODE_ENV === 'production') {
  // In production, use Application Default Credentials
  storage = new Storage();
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // In development with explicit credentials
  storage = new Storage({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
  });
} else {
  // Fallback to default credentials
  storage = new Storage();
}

const bucketName = process.env.NODE_ENV === 'production' 
  ? (process.env.GCS_PRODUCTION_BUCKET_NAME || 'zavora-ai-generated-images')
  : (process.env.GCS_BUCKET_NAME || 'gemini-image-test-bucket');
const bucket = storage.bucket(bucketName);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_IMAGE', message: 'Image is required' } },
        { status: 400 }
      );
    }

    // Create a hash of the file to use as filename
    const buffer = await image.arrayBuffer();
    const hash = createHash('md5').update(Buffer.from(buffer)).digest('hex');
    
    // Determine file extension from mime type
    const mimeType = image.type;
    let extension = 'png';
    
    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
      extension = 'jpg';
    } else if (mimeType === 'image/webp') {
      extension = 'webp';
    }
    
    const filename = `${hash}.${extension}`;
    
    // Upload the file to Google Cloud Storage
    const file = bucket.file(filename);
    await file.save(Buffer.from(buffer), {
      metadata: {
        contentType: mimeType,
      }
    });
    
    // Make the file publicly accessible
    await file.makePublic();
    
    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
    
    // Create metadata
    const metadata = {
      id: uuidv4(),
      prompt: null,
      createdAt: new Date().toISOString(),
      filename,
      mimeType,
      size: buffer.byteLength,
      url: publicUrl,
    };
    
    // Return the image URL
    return NextResponse.json({
      success: true,
      data: {
        imageUrl: publicUrl,
        description: null,
        metadata,
      },
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { success: false, error: { code: 'UPLOAD_ERROR', message: 'Failed to upload image' } },
      { status: 500 }
    );
  }
}