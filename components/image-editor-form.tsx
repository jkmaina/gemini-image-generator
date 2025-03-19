"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ImageEditorFormProps {
  onImageEdited?: (imageUrl: string) => void;
  initialImageUrl?: string;
  readOnlyUrl?: boolean;
}

export function ImageEditorForm({ 
  onImageEdited, 
  initialImageUrl = "", 
  readOnlyUrl = false 
}: ImageEditorFormProps) {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update imageUrl when initialImageUrl changes
  useEffect(() => {
    if (initialImageUrl) {
      setImageUrl(initialImageUrl);
    }
  }, [initialImageUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError("Please enter editing instructions");
      return;
    }

    if (!imageUrl.trim()) {
      setError("Please enter an image URL");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, imageUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to edit image");
      }

      if (onImageEdited && data.data?.imageUrl) {
        onImageEdited(data.data.imageUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit Image</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid w-full gap-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                placeholder="Enter the URL of the image to edit (e.g., /generated-images/filename.png)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={isLoading || readOnlyUrl}
                className={readOnlyUrl ? "bg-muted cursor-not-allowed" : ""}
              />
              {readOnlyUrl && (
                <p className="text-xs text-muted-foreground">
                  Using the image you just generated. To use a different image, clear the URL above.
                </p>
              )}
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="editPrompt">Editing Instructions</Label>
              <Textarea
                id="editPrompt"
                placeholder="Describe how you want to edit the image..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px]"
                disabled={isLoading}
                autoFocus={readOnlyUrl}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Editing..." : "Edit Image"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}