'use client';

import { useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function ImageEditor() {
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setUploadedFile(file);
        setSelectedImage(URL.createObjectURL(file));
        setEditedImage(null);
      }
    }
  });

  const handleEdit = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    if (!editPrompt.trim()) {
      setError('Please enter editing instructions');
      return;
    }

    setIsEditing(true);
    setError(null);
    
    try {
      // If the image is from an upload, we need to upload it first
      let imageUrl = selectedImage;
      
      if (uploadedFile) {
        const formData = new FormData();
        formData.append('image', uploadedFile);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }
        
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.imageUrl;
      }
      
      // Now edit the image
      const response = await fetch('/api/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageUrl,
          prompt: editPrompt 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to edit image');
      }
      
      setEditedImage(data.data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <Card className="w-full mt-8">
      <CardHeader>
        <CardTitle>Edit Image</CardTitle>
        <CardDescription>
          Modify existing images with natural language instructions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full gap-6">
          <div 
            {...getRootProps()} 
            className="border-2 border-dashed rounded-lg p-8 cursor-pointer hover:border-primary/50 transition-colors text-center bg-muted/50"
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-base font-medium">Drag & drop an image here, or click to select</p>
            <p className="text-sm text-muted-foreground mt-1">PNG, JPG, JPEG, or WebP</p>
          </div>
          
          {selectedImage && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Selected Image</h3>
              <div className="border rounded-md overflow-hidden shadow-sm">
                <img 
                  src={selectedImage} 
                  alt="Selected for editing" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}
          
          <div className="flex flex-col space-y-2">
            <Label htmlFor="editPrompt" className="text-base">
              Editing instructions
            </Label>
            <Textarea
              id="editPrompt"
              placeholder="Describe how you want to edit the image in detail..."
              className="min-h-32 text-base"
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
            />
          </div>
          
          {error && (
            <div className="p-4 bg-destructive/15 text-destructive rounded-md border border-destructive/30">
              <p>{error}</p>
            </div>
          )}
          
          {editedImage && !error && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Edited Image</h3>
              <div className="border rounded-md overflow-hidden shadow-sm">
                <img 
                  src={editedImage} 
                  alt="Edited result" 
                  className="w-full h-auto"
                />
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm"><span className="font-medium">Edit instructions:</span> {editPrompt}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleEdit}
          disabled={isEditing || !selectedImage || !editPrompt.trim()}
          className="w-full"
          size="lg"
        >
          {isEditing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Editing Image...
            </>
          ) : (
            'Edit Image'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}