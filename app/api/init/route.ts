import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Initialize directories function
async function initDirectories() {
  const imagesDir = path.join(process.cwd(), "public", "generated-images");
  const metadataDir = path.join(process.cwd(), "data", "metadata");

  try {
    await fs.mkdir(imagesDir, { recursive: true });
    await fs.mkdir(metadataDir, { recursive: true });
    return true;
  } catch (error) {
    console.error('Error initializing directories:', error);
    return false;
  }
}

export async function GET() {
  const success = await initDirectories();
  
  if (success) {
    return NextResponse.json({
      success: true,
      message: 'Directories initialized successfully'
    });
  } else {
    return NextResponse.json({
      success: false,
      error: {
        code: 'INIT_FAILED',
        message: 'Failed to initialize directories'
      }
    }, { status: 500 });
  }
}