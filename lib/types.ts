// Define the interface for conversation history items
export interface HistoryItem {
  role: "user" | "model";
  parts: HistoryPart[];
}

// Define the interface for history parts
export interface HistoryPart {
  text?: string;
  image?: string;
}

// Define the interface for image metadata
export interface ImageMetadata {
  id: string;
  prompt: string;
  createdAt: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
}

// Define the interface for API response
export interface ApiResponse {
  success: boolean;
  data?: {
    imageUrl?: string;
    description?: string;
    metadata?: ImageMetadata;
    history?: HistoryItem[];
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Define supported image formats
export type ImageFormat = 'png' | 'jpeg' | 'webp';

// Define image generation options
export interface ImageOptions {
  format?: ImageFormat;
  width?: number;
  height?: number;
  quality?: number;
}