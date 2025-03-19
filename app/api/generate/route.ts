import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiResponse, ImageOptions } from "@/lib/types";
import { saveImage } from "@/lib/server-utils";

// Initialize the Google Gen AI client with your API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Define the model ID for Gemini 2.0 Flash experimental
const MODEL_ID = "gemini-2.0-flash-exp";

export async function POST(req: NextRequest) {
  try {
    // Parse JSON request
    const requestData = await req.json();
    const { prompt, options } = requestData;

    if (!prompt) {
      return NextResponse.json({
        success: false,
        error: {
          code: "MISSING_PROMPT",
          message: "Prompt is required"
        }
      } as ApiResponse, { status: 400 });
    }

    // Get the model with the correct configuration
    const model = genAI.getGenerativeModel({
      model: MODEL_ID,
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        // @ts-expect-error - Gemini API JS is missing this type
        responseModalities: ["Text", "Image"],
      },
    });

    // Send the prompt to generate an image
    const result = await model.generateContent(prompt);
    const response = result.response;

    let textResponse = null;
    let imageData = null;
    let mimeType = "image/png";

    // Process the response
    if (response && response.candidates && response.candidates.length > 0 && 
        response.candidates[0].content && response.candidates[0].content.parts) {
      const parts = response.candidates[0].content.parts;
      
      for (const part of parts) {
        if (part && "inlineData" in part && part.inlineData) {
          // Get the image data
          imageData = part.inlineData.data;
          mimeType = part.inlineData.mimeType || "image/png";
        } else if (part && "text" in part && part.text) {
          // Store the text
          textResponse = part.text;
        }
      }
    }

    if (!imageData) {
      return NextResponse.json({
        success: false,
        error: {
          code: "NO_IMAGE_GENERATED",
          message: "No image was generated"
        }
      } as ApiResponse, { status: 500 });
    }

    // Save the image and get metadata
    const metadata = await saveImage(
      imageData, 
      prompt, 
      mimeType, 
      options as ImageOptions
    );

    // Return the image URL, description, and metadata as JSON
    return NextResponse.json({
      success: true,
      data: {
        imageUrl: metadata.url,
        description: textResponse,
        metadata
      }
    } as ApiResponse);
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json({
      success: false,
      error: {
        code: "GENERATION_FAILED",
        message: "Failed to generate image",
        details: error instanceof Error ? error.message : String(error)
      }
    } as ApiResponse, { status: 500 });
  }
}