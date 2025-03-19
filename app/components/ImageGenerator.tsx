'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to generate image');
      }
      
      setGeneratedImage(data.data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full mt-8">
      <CardHeader>
        <CardTitle>Generate Image</CardTitle>
        <CardDescription>
          Create images from text prompts using Google's Gemini 2.0 Flash model
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full gap-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="prompt" className="text-base">
              Enter your prompt
            </Label>
            <Textarea
              id="prompt"
              placeholder="Describe the image you want to generate in detail..."
              className="min-h-32 text-base"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          
          {error && (
            <div className="p-4 bg-destructive/15 text-destructive rounded-md border border-destructive/30">
              <p>{error}</p>
            </div>
          )}
          
          {generatedImage && !error && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Generated Image</h3>
              <div className="border rounded-md overflow-hidden shadow-sm">
                <img 
                  src={generatedImage} 
                  alt="Generated from prompt" 
                  className="w-full h-auto"
                />
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm"><span className="font-medium">Prompt:</span> {prompt}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Image'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}