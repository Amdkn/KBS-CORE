import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, Search } from 'lucide-react';
import ListingCard from '../components/ListingCard';
import { Listing } from '../types/database';
import { generateMockListings } from '../lib/utils';

const Saved = () => {
  const [savedListings, setSavedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching saved items
    setTimeout(() => {
      const all = generateMockListings() as Listing[];
      // Just pick a few random ones to simulate "Saved" state
      setSavedListings(all.slice(0, 3));
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-2 gap-4 w-full">
                <div className="aspect-[4/5] bg-gray-200 rounded-3xl"></div>
                <div className="aspect-[4/5] bg-gray-200 rounded-3xl"></div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-4">
      {/* Header */}
      <header className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Saved Items</h1>
        <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-1 rounded-full">
          {savedListings.length}
        </span>
      </header>

      {/* Content */}
      {savedListings.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {savedListings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center pt-20 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <Heart size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No saved items yet</h3>
          <p className="text-gray-500 max-w-[200px] mb-6">
            Tap the heart icon on any listing to save it for later.
          </p>
          <Link 
            to="/home"
            className="px-6 py-3 bg-primary-500 text-white font-bold rounded-full shadow-lg shadow-primary-200 hover:bg-primary-600 transition-colors"
          >
            Explore Marketplace
          </Link>
        </div>
      )}
    </div>
  );
};

export default Saved;