import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronRight, ExternalLink } from 'lucide-react';
import { Story } from '../types/database';
import { useNavigate } from 'react-router-dom';

interface StoryViewerProps {
  stories: Story[];
  initialIndex?: number;
  onClose: () => void;
  onStorySeen: (storyId: string) => void;
}

const STORY_DURATION = 5000; // 5 seconds per story

const StoryViewer: React.FC<StoryViewerProps> = ({ 
  stories, 
  initialIndex = 0, 
  onClose,
  onStorySeen 
}) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number | null>(null);
  const pausedProgressRef = useRef<number>(0);

  const currentStory = stories[currentIndex];

  // Mark seen when story loads
  useEffect(() => {
    if (currentStory) {
      onStorySeen(currentStory.id);
    }
  }, [currentIndex, currentStory, onStorySeen]);

  // Handle Next
  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
      startTimeRef.current = null;
      pausedProgressRef.current = 0;
    } else {
      onClose(); // Close if it's the last story
    }
  }, [currentIndex, stories.length, onClose]);

  // Handle Previous
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
      startTimeRef.current = null;
      pausedProgressRef.current = 0;
    } else {
        // Reset current story if tapped left on first story
        setProgress(0);
        startTimeRef.current = null;
        pausedProgressRef.current = 0;
    }
  }, [currentIndex]);

  // Timer Animation Frame Loop
  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    
    // Calculate elapsed based on paused offset
    const elapsed = timestamp - startTimeRef.current + pausedProgressRef.current;
    
    // Progress 0 to 100
    const newProgress = Math.min((elapsed / STORY_DURATION) * 100, 100);
    setProgress(newProgress);

    if (newProgress < 100) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      handleNext();
    }
  }, [handleNext]);

  // Effect to manage animation loop
  useEffect(() => {
    if (isPaused) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      // Save current progress time equivalent
      pausedProgressRef.current = (progress / 100) * STORY_DURATION;
      startTimeRef.current = null;
    } else {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [currentIndex, isPaused, animate]); // Removed 'progress' from deps to avoid infinite re-render loop reset

  // Touch Handlers
  const handleTouchStart = () => setIsPaused(true);
  const handleTouchEnd = () => {
      setIsPaused(false);
      // Reset start time so animation resumes correctly relative to saved progress
      startTimeRef.current = null; 
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Content Container */}
      <div className="relative w-full h-full max-w-md mx-auto bg-gray-900 overflow-hidden">
        
        {/* Background Image */}
        <img 
          src={currentStory.media_url} 
          alt={currentStory.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

        {/* Progress Bars */}
        <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
          {stories.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all ease-linear duration-100"
                style={{ 
                  width: idx === currentIndex 
                    ? `${progress}%` 
                    : idx < currentIndex ? '100%' : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header Controls */}
        <div className="absolute top-8 left-4 right-4 flex justify-between items-center z-20 text-white">
          <div className="flex items-center gap-2">
             {/* Optional: User Avatar or time */}
             <span className="text-xs font-semibold drop-shadow-md">
                {new Date(currentStory.created_at).getHours() < 12 ? 'Yesterday' : 'Today'}
             </span>
          </div>
          <button onClick={onClose} className="p-2 bg-black/20 backdrop-blur-md rounded-full hover:bg-white/20">
            <X size={20} />
          </button>
        </div>

        {/* Tap Zones */}
        <div className="absolute inset-0 flex z-10">
          <div 
            className="w-1/3 h-full" 
            onClick={handlePrev} 
            onTouchStart={handleTouchStart} 
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
          />
          <div 
            className="w-2/3 h-full" 
            onClick={handleNext} 
            onTouchStart={handleTouchStart} 
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
          />
        </div>

        {/* Footer Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white pb-12">
          <h2 className="text-xl font-bold mb-2 drop-shadow-md">{currentStory.title}</h2>
          
          {currentStory.cta_text && (
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                    if (currentStory.cta_link) navigate(currentStory.cta_link);
                }}
                className="mt-4 w-full bg-white text-black font-bold py-3 rounded-full flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
            >
                {currentStory.cta_text}
                <ChevronRight size={16} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default StoryViewer;