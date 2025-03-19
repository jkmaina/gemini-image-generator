import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

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
    const filepath = join(process.cwd(), 'public', 'generated-images', filename);
    
    // Write the file to disk
    await writeFile(filepath, Buffer.from(buffer));
    
    // Create metadata
    const metadata = {
      id: uuidv4(),
      prompt: null,
      createdAt: new Date().toISOString(),
      filename,
      mimeType,
      size: buffer.byteLength,
      url: `/generated-images/${filename}`,
    };
    
    // Return the image URL
    return NextResponse.json({
      success: true,
      data: {
        imageUrl: `/generated-images/${filename}`,
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