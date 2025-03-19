import Link from 'next/link';
import InitClient from './InitClient';
import { ArrowRight, Image, Wand2, Database, Clock } from 'lucide-react';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12">
      {/* Client component to initialize directories */}
      <InitClient />
      
      <div className="z-10 max-w-5xl w-full items-center justify-between">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Gemini Image Generation API
        </h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Interactive API Documentation</CardTitle>
            <CardDescription>
              Explore and test the API using our interactive Swagger documentation. Generate and edit images directly from your browser.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/docs">
                View API Docs <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Image Generator Component */}
        <ImageGenerator />
        
        {/* Image Editor Component */}
        <ImageEditor />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Generate Images</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p>Create stunning images from text prompts using Google's Gemini 2.0 Flash model with advanced AI capabilities.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Edit Images</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p>Modify existing images with natural language instructions. Change colors, styles, backgrounds and more.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Manage Images</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p>List, retrieve, and delete generated images with a simple RESTful API. Track metadata and usage.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Automatic Cleanup</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p>Automatically remove old images to save storage space. Configure retention policies to match your needs.</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by Google Gemini 2.0 Flash • Built with Next.js • Containerized with Docker
          </p>
        </div>
      </div>
    </main>
  );
}