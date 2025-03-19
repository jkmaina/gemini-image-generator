"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ApiInfo() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gemini Image Generation API</CardTitle>
        <CardDescription>
          Generate and edit images using Google&apos;s Gemini 2.0 Flash model
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Key Features</h3>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Generate high-quality images from text prompts</li>
              <li>Edit existing images with natural language instructions</li>
              <li>RESTful API for easy integration</li>
              <li>Persistent storage for images and metadata</li>
              <li>Rate limiting to prevent abuse</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">API Endpoints</h3>
            <div className="mt-2 space-y-2">
              <div className="p-2 bg-muted rounded-md">
                <code className="text-sm">POST /api/generate</code>
                <p className="text-sm text-muted-foreground mt-1">Generate an image from a text prompt</p>
              </div>
              <div className="p-2 bg-muted rounded-md">
                <code className="text-sm">POST /api/edit</code>
                <p className="text-sm text-muted-foreground mt-1">Edit an existing image with instructions</p>
              </div>
              <div className="p-2 bg-muted rounded-md">
                <code className="text-sm">GET /api/images</code>
                <p className="text-sm text-muted-foreground mt-1">List all generated images</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button asChild variant="outline">
              <Link href="/docs">
                API Documentation
              </Link>
            </Button>
            <Button asChild>
              <a href="https://github.com/jkmaina/gemini-image-generator" target="_blank" rel="noopener noreferrer">
                GitHub Repository
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}