import Link from 'next/link';
import InitClient from './InitClient';
import { ArrowRight, Image, Wand2, Database, Clock } from 'lucide-react';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12">
      {/* Client component to initialize directories */}
      <InitClient />
      
      <div className="z-10 max-w-5xl w-full items-center justify-between">
        <h1 className="page-title">
          Gemini Image Generation API
        </h1>
        
        <div className="api-card">
          <h2 className="text-2xl font-semibold mb-4">Interactive API Documentation</h2>
          <p className="mb-6 text-lg">
            Explore and test the API using our interactive Swagger documentation. Generate and edit images directly from your browser.
          </p>
          <Link href="/docs" className="docs-button">
            View API Docs <ArrowRight className="inline ml-2" size={18} />
          </Link>
        </div>
        
        {/* Image Generator Component */}
        <ImageGenerator />
        
        {/* Image Editor Component */}
        <ImageEditor />
        
        <div className="feature-grid mt-12">
          <div className="feature-card">
            <div className="flex items-center mb-3">
              <Wand2 className="mr-2 text-blue-500" size={24} />
              <h2 className="text-xl font-semibold">Generate Images</h2>
            </div>
            <p>Create stunning images from text prompts using Google's Gemini 2.0 Flash model with advanced AI capabilities.</p>
          </div>
          
          <div className="feature-card">
            <div className="flex items-center mb-3">
              <Image className="mr-2 text-blue-500" size={24} />
              <h2 className="text-xl font-semibold">Edit Images</h2>
            </div>
            <p>Modify existing images with natural language instructions. Change colors, styles, backgrounds and more.</p>
          </div>
          
          <div className="feature-card">
            <div className="flex items-center mb-3">
              <Database className="mr-2 text-blue-500" size={24} />
              <h2 className="text-xl font-semibold">Manage Images</h2>
            </div>
            <p>List, retrieve, and delete generated images with a simple RESTful API. Track metadata and usage.</p>
          </div>
          
          <div className="feature-card">
            <div className="flex items-center mb-3">
              <Clock className="mr-2 text-blue-500" size={24} />
              <h2 className="text-xl font-semibold">Automatic Cleanup</h2>
            </div>
            <p>Automatically remove old images to save storage space. Configure retention policies to match your needs.</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm opacity-70">
            Powered by Google Gemini 2.0 Flash • Built with Next.js • Containerized with Docker
          </p>
        </div>
      </div>
    </main>
  );
}