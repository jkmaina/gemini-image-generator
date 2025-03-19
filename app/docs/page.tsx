'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import './styles.css';

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function DocsPage() {
  const [spec, setSpec] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSpec() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/docs');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch API docs: ${response.statusText}`);
        }
        
        const data = await response.json();
        setSpec(data);
      } catch (err) {
        console.error('Error loading API docs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load API documentation');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSpec();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="message-box">
          <h2 className="loading-text">Loading API documentation...</h2>
          <div className="animate-pulse">Please wait...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-container">
        <div className="message-box error-box">
          <h2 className="error-title">Error Loading Documentation</h2>
          <p className="error-message">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="loading-container">
        <div className="message-box">
          <h2 className="loading-text">No API documentation available</h2>
          <p>The API specification could not be loaded.</p>
        </div>
      </div>
    );
  }

  // Configure Swagger UI options
  const uiOptions = {
    // Disable fetching specs via URL
    url: undefined,
    spec: spec,
    // Disable "Try it out" functionality to prevent CORS issues
    supportedSubmitMethods: [],
    // Other UI options
    docExpansion: "list" as const,
    deepLinking: true,
    defaultModelsExpandDepth: -1,
    // Prevent Swagger UI from making external requests
    validatorUrl: null,
    // Disable the "Authorize" button
    showMutatedRequest: false,
    // Disable the "Models" section
    defaultModelRendering: "example" as const,
    // Disable the "Try it out" button
    tryItOutEnabled: false
  };

  return (
    <div className="docs-page">
      <SwaggerUI {...uiOptions} />
    </div>
  );
}