import dynamic from 'next/dynamic';
import React from 'react';

// Client-side only entry point for the Application
const App = dynamic(() => import('../App'), { ssr: false });

export default function Index() {
  return (
    <div suppressHydrationWarning>
      <App />
    </div>
  );
}
