import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Story } from '../types/database';
import StoryViewer from './StoryViewer';

// Mock Data structure for "Community Circles"
interface CommunityCircle {
  id: string;
  name: string;
  image: string;
  stories: Story[];
  circle_id?: string; // Associated Location ID
}

interface StoriesTrayProps {
  currentCircleId?: string;
}

const StoriesTray: React.FC<StoriesTrayProps> = ({ currentCircleId }) => {
  const [communities, setCommunities] = useState<CommunityCircle[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<CommunityCircle[]>([]);
  const [seenStories, setSeenStories] = useState<Set<string>>(new Set());
  
  // Viewer State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeStories, setActiveStories] = useState<Story[]>([]);
  const [initialStoryIndex, setInitialStoryIndex] = useState(0);

  useEffect(() => {
    // Generate Mock Data with Circle IDs
    const mockCommunities: CommunityCircle[] = [
      { 
        id: '1', 
        name: 'Parent Swap', 
        image: 'https://images.unsplash.com/photo-1595156637373-c6ec4342578d?auto=format&fit=crop&q=80&w=200',
        circle_id: 'c1', // Brooklyn
        stories: [
            { id: 's1', media_url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=800', title: 'Stroller Donation Drive this Saturday!', type: 'IMAGE', created_at: new Date().toISOString(), expires_at: '', cta_text: 'View Event', cta_link: '/home' },
            { id: 's2', media_url: 'https://images.unsplash.com/photo-1603539276532-626a58a74c65?auto=format&fit=crop&q=80&w=800', title: 'New Swap Rule: Clean Items Only', type: 'IMAGE', created_at: new Date().toISOString(), expires_at: '' }
        ]
      },
      { 
        id: '2', 
        name: "Artists' Exch.", 
        image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=200',
        circle_id: 'c1', // Brooklyn
        stories: [
            { id: 's3', media_url: 'https://images.unsplash.com/photo-1460661631189-a05e6b7e1909?auto=format&fit=crop&q=80&w=800', title: 'Featured Artist: Sarah J.', type: 'IMAGE', created_at: new Date().toISOString(), expires_at: '', cta_text: 'See Profile', cta_link: '/profile' }
        ]
      },
      { 
        id: '3', 
        name: 'Park Slope', 
        image: 'https://images.unsplash.com/photo-1449824913929-2b3a3e357926?auto=format&fit=crop&q=80&w=200',
        circle_id: 'c1', // Brooklyn
        stories: [
            { id: 's4', media_url: 'https://images.unsplash.com/photo-1565538420183-f273b3e64f72?auto=format&fit=crop&q=80&w=800', title: 'Street Fair - Traffic Alert', type: 'IMAGE', created_at: new Date().toISOString(), expires_at: '' }
        ]
      },
      { 
        id: '4', 
        name: 'Techies', 
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=200',
        circle_id: 'c2', // Florence
        stories: [] // Empty
      },
      {
        id: '5',
        name: 'Florence Swap',
        image: 'https://images.unsplash.com/photo-1556909212-324f02f489c3?auto=format&fit=crop&q=80&w=200',
        circle_id: 'c2', // Florence
        stories: [
            { id: 's5', media_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800', title: 'Community Yard Sale', type: 'IMAGE', created_at: new Date().toISOString(), expires_at: '' }
        ]
      }
    ];
    setCommunities(mockCommunities);
    
    // Load seen stories from local storage if needed (mocked here)
    const savedSeen = localStorage.getItem('seenStories');
    if(savedSeen) setSeenStories(new Set(JSON.parse(savedSeen)));
  }, []);

  // Filter Logic
  useEffect(() => {
    if (!currentCircleId) {
        setFilteredCommunities(communities);
    } else {
        setFilteredCommunities(communities.filter(c => c.circle_id === currentCircleId));
    }
  }, [currentCircleId, communities]);

  const handleStoryClick = (community: CommunityCircle) => {
    if (community.stories.length === 0) return;

    // Find first unseen story index
    let startIndex = community.stories.findIndex(s => !seenStories.has(s.id));
    if (startIndex === -1) startIndex = 0; // If all seen, start from beginning

    setActiveStories(community.stories);
    setInitialStoryIndex(startIndex);
    setViewerOpen(true);
  };

  const handleStorySeen = (storyId: string) => {
    setSeenStories(prev => {
        const newSet = new Set(prev);
        newSet.add(storyId);
        // Persist
        localStorage.setItem('seenStories', JSON.stringify(Array.from(newSet)));
        return newSet;
    });
  };

  const hasUnseenStories = (community: CommunityCircle) => {
    if (community.stories.length === 0) return false;
    return community.stories.some(s => !seenStories.has(s.id));
  };

  // If no communities for this location
  if (filteredCommunities.length === 0) {
      return (
        <section className="mb-6 px-1">
             <div className="bg-primary-50 rounded-2xl p-4 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-gray-900 text-sm">New Community Hub</h3>
                    <p className="text-xs text-gray-500">Be the first to create a story!</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                    <Plus size={20} />
                </div>
             </div>
        </section>
      );
  }

  return (
    <>
      <section className="mb-8">
        <h2 className="font-bold text-xl mb-4 text-gray-900">Community Hub</h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1">
          {filteredCommunities.map(circle => {
            const hasUnseen = hasUnseenStories(circle);
            const hasStories = circle.stories.length > 0;
            
            return (
              <div 
                key={circle.id} 
                onClick={() => handleStoryClick(circle)}
                className={`flex flex-col items-center gap-2 min-w-[80px] cursor-pointer group transition-transform ${hasStories ? 'active:scale-95' : 'opacity-80'}`}
              >
                <div className={`w-20 h-20 rounded-full p-[3px] ${
                    hasUnseen 
                    ? 'bg-gradient-to-tr from-primary-400 to-green-300' 
                    : 'bg-gray-200'
                }`}>
                  <div className="w-full h-full rounded-full border-[3px] border-white overflow-hidden bg-white">
                    <img 
                        src={circle.image} 
                        alt={circle.name} 
                        className={`w-full h-full object-cover transition-opacity ${hasStories ? 'group-hover:opacity-90' : 'grayscale opacity-70'}`} 
                    />
                  </div>
                </div>
                <span className="text-xs font-medium text-center text-gray-700 leading-tight w-20 truncate">
                    {circle.name}
                </span>
              </div>
            );
          })}
          
          {/* Add Community Button */}
          <div className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer">
             <div className="w-20 h-20 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:border-primary-300 hover:text-primary-500 transition-colors">
                <Plus size={24} />
             </div>
             <span className="text-xs font-medium text-gray-500">Join +</span>
          </div>
        </div>
      </section>

      {/* Full Screen Viewer */}
      {viewerOpen && activeStories.length > 0 && (
        <StoryViewer 
            stories={activeStories} 
            initialIndex={initialStoryIndex}
            onClose={() => setViewerOpen(false)}
            onStorySeen={handleStorySeen}
        />
      )}
    </>
  );
};

export default StoriesTray;