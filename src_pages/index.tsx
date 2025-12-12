import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the App component with SSR disabled
// This is crucial because App uses HashRouter which needs the window object
const App = dynamic(() => import('../App'), { ssr: false });

export default function Page() {
  return (
    <div suppressHydrationWarning>
      {/* 
        Client-only SPA mounting point. 
        suppressHydrationWarning used because of potential client/server mismatch 
        with the empty div vs rendered app content 
      */}
      <App />
    </div>
  );
}
