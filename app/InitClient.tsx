'use client';

import { useEffect } from 'react';

export default function InitClient() {
  // Initialize directories when the component mounts
  useEffect(() => {
    fetch('/api/init')
      .then(res => res.json())
      .catch(err => console.error('Error initializing directories:', err));
  }, []);

  // This component doesn't render anything
  return null;
}