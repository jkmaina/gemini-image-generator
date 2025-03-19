"use client";

import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageGeneratorForm } from "@/components/image-generator-form";
import { ImageEditorForm } from "@/components/image-editor-form";
import { ImageDisplay } from "@/components/image-display";
import { ApiInfo } from "@/components/api-info";

export default function Home() {
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("generate");

  const handleImageGenerated = (imageUrl: string) => {
    setCurrentImageUrl(imageUrl);
    // Automatically switch to edit tab after generating an image
    setActiveTab("edit");
  };

  const handleImageEdited = (imageUrl: string) => {
    setCurrentImageUrl(imageUrl);
  };

  return (
    <main className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col items-center justify-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Gemini Image Generator</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Generate and edit images using Google&apos;s Gemini 2.0 Flash model
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">Generate</TabsTrigger>
              <TabsTrigger value="edit">Edit</TabsTrigger>
            </TabsList>
            <TabsContent value="generate">
              <ImageGeneratorForm 
                onImageGenerated={handleImageGenerated} 
              />
            </TabsContent>
            <TabsContent value="edit">
              <ImageEditorForm 
                onImageEdited={handleImageEdited} 
                initialImageUrl={currentImageUrl || ""}
                readOnlyUrl={!!currentImageUrl}
              />
            </TabsContent>
          </Tabs>
        </div>
        <div>
          <ImageDisplay imageUrl={currentImageUrl} />
        </div>
      </div>

      <div className="mb-8">
        <ApiInfo />
      </div>

      <footer className="text-center text-sm text-muted-foreground py-4 border-t">
        <p>
          Powered by Google&apos;s Gemini 2.0 Flash model. Built with Next.js.
        </p>
      </footer>
    </main>
  );
}