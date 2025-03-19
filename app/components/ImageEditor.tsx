'use client';

import { useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

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
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-8">
      <h2 className="text-2xl font-bold mb-4">Edit Image</h2>
      
      <div className="mb-4">
        <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-md p-6 cursor-pointer hover:border-blue-500 transition-colors">
          <input {...getInputProps()} />
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2">Drag & drop an image here, or click to select</p>
            <p className="text-sm text-gray-500">PNG, JPG, JPEG, or WebP</p>
          </div>
        </div>
      </div>
      
      {selectedImage && (
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Selected Image</h3>
          <div className="border rounded-md overflow-hidden">
            <img 
              src={selectedImage} 
              alt="Selected for editing" 
              className="w-full h-auto"
            />
          </div>
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="editPrompt" className="block text-sm font-medium mb-2">
          Editing instructions
        </label>
        <textarea
          id="editPrompt"
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
          rows={3}
          placeholder="Describe how you want to edit the image..."
          value={editPrompt}
          onChange={(e) => setEditPrompt(e.target.value)}
        />
      </div>
      
      <button
        onClick={handleEdit}
        disabled={isEditing || !selectedImage || !editPrompt.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isEditing ? (
          <>
            <Loader2 className="inline-block animate-spin mr-2" size={16} />
            Editing...
          </>
        ) : (
          'Edit Image'
        )}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {editedImage && !error && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Edited Image</h3>
          <div className="border rounded-md overflow-hidden">
            <img 
              src={editedImage} 
              alt="Edited result" 
              className="w-full h-auto"
            />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            <p>Edit instructions: {editPrompt}</p>
          </div>
        </div>
      )}
    </div>
  );
}