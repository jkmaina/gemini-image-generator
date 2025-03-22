import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { saveImage, fetchImageFromUrl } from '@/lib/storage';
import { rateLimit } from '@/lib/rate-limit';
import { limiter } from '@/lib/limiter';

// Initialize the Google Generative AI SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const { success, limit, remaining, reset } = await limiter.check(request);
    
    if (!success) {
      return new NextResponse(JSON.stringify({
        error: 'Rate limit exceeded',
        limit,
        remaining,
        reset,
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      });
    }
    
    const { prompt, imageUrl } = await request.json();
    
    if (!prompt || !imageUrl) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    // Fetch image data from URL
    const imageBuffer = await fetchImageFromUrl(imageUrl);
    const base64Image = imageBuffer.toString('base64');
    
    // Get the model with the correct configuration
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.4,
        topP: 0.8,
        topK: 32,
      },
    });
    
    // Create a prompt with the image
    const textPart: Part = { text: prompt };
    const imagePart: Part = {
      inlineData: {
        mimeType: 'image/png',
        data: base64Image,
      }
    };
    
    // Generate the image
    const result = await model.generateContent([textPart, imagePart]);
    
    const response = result.response;
    const text = response.text();
    
    // Extract the base64 image data from the response
    const base64Data = text.split(',')[1];
    
    if (!base64Data) {
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
    }
    
    // Save the image and get metadata
    const metadata = await saveImage(base64Data, prompt);
    
    return NextResponse.json({ 
      success: true,
      message: 'Image edited successfully',
      image: metadata
    });
  } catch (error: any) {
    console.error('Error editing image:', error);
    return NextResponse.json({ 
      error: 'Failed to edit image',
      message: error.message
    }, { status: 500 });
  }
}