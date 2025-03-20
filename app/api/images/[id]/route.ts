import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getImageMetadata } from "@/lib/server-utils";
import { ApiResponse } from "@/lib/types";

// Get image metadata by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get image metadata
    const metadata = await getImageMetadata(id);
    
    if (!metadata) {
      return NextResponse.json({
        success: false,
        error: {
          code: "IMAGE_NOT_FOUND",
          message: `Image with ID ${id} not found`
        }
      } as ApiResponse, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        metadata
      }
    } as ApiResponse);
  } catch (error) {
    console.error("Error getting image metadata:", error);
    return NextResponse.json({
      success: false,
      error: {
        code: "GET_METADATA_FAILED",
        message: "Failed to get image metadata",
        details: error instanceof Error ? error.message : String(error)
      }
    } as ApiResponse, { status: 500 });
  }
}

// Delete image by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get image metadata
    const metadata = await getImageMetadata(id);
    
    if (!metadata) {
      return NextResponse.json({
        success: false,
        error: {
          code: "IMAGE_NOT_FOUND",
          message: `Image with ID ${id} not found`
        }
      } as ApiResponse, { status: 404 });
    }
    
    // Delete the image file
    const imagesDir = path.join(process.cwd(), "public", "generated-images");
    const imagePath = path.join(imagesDir, metadata.filename);
    const imageExists = await fs.stat(imagePath).catch(() => false);
    if (imageExists) {
      await fs.unlink(imagePath);
    }
    
    // Delete the metadata file
    const metadataDir = path.join(process.cwd(), "data", "metadata");
    const metadataPath = path.join(metadataDir, `${id}.json`);
    const metadataExists = await fs.stat(metadataPath).catch(() => false);
    if (metadataExists) {
      await fs.unlink(metadataPath);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        message: `Image ${id} deleted successfully`
      }
    } as ApiResponse);
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json({
      success: false,
      error: {
        code: "DELETE_FAILED",
        message: "Failed to delete image",
        details: error instanceof Error ? error.message : String(error)
      }
    } as ApiResponse, { status: 500 });
  }
}