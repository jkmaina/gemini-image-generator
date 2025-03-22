import { NextRequest, NextResponse } from "next/server";
import { listImageMetadata, cleanupOldImages } from "@/lib/storage";
import { ApiResponse } from "@/lib/types";

// List images endpoint
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    
    // Get list of images with metadata
    const images = await listImageMetadata(limit);
    
    return NextResponse.json({
      success: true,
      data: {
        images,
        pagination: {
          limit,
          offset,
          total: images.length
        }
      }
    } as ApiResponse);
  } catch (error) {
    console.error("Error listing images:", error);
    return NextResponse.json({
      success: false,
      error: {
        code: "LIST_FAILED",
        message: "Failed to list images",
        details: error instanceof Error ? error.message : String(error)
      }
    } as ApiResponse, { status: 500 });
  }
}

// Cleanup old images endpoint
export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const maxAge = parseInt(searchParams.get("maxAge") || "7");
    
    // Clean up old images
    const deletedCount = await cleanupOldImages(maxAge);
    
    return NextResponse.json({
      success: true,
      data: {
        deletedCount,
        maxAge
      }
    } as ApiResponse);
  } catch (error) {
    console.error("Error cleaning up images:", error);
    return NextResponse.json({
      success: false,
      error: {
        code: "CLEANUP_FAILED",
        message: "Failed to clean up images",
        details: error instanceof Error ? error.message : String(error)
      }
    } as ApiResponse, { status: 500 });
  }
}