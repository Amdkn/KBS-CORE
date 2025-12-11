import React from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Listing } from '../types/database';
import { formatPrice } from '../lib/utils';

interface ListingCardProps {
  listing: Listing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const isDonation = listing.type === 'DONATION';
  const imageUrl = listing.images?.[0]?.storage_path || 'https://via.placeholder.com/300';

  return (
    <Link to={`/items/${listing.id}`} className="block group">
      <div className="relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Heart Button */}
          <button 
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-600 hover:text-red-500 hover:bg-white transition-colors"
            onClick={(e) => {
              e.preventDefault();
              // Handle like logic
            }}
          >
            <Heart size={18} />
          </button>

          {/* Type Badge */}
          {isDonation && (
            <div className="absolute bottom-3 left-3 px-3 py-1 bg-primary-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
              Free
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-gray-900 line-clamp-1 text-lg">{listing.title}</h3>
            <span className={`font-bold ${isDonation ? 'text-primary-600' : 'text-gray-900'}`}>
              {formatPrice(listing.price_cents, listing.type)}
            </span>
          </div>
          
          <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
             {listing.distance} miles away
          </p>

          <div className="mt-auto flex items-center gap-2">
            <img 
              src={listing.seller?.avatar_url} 
              alt={listing.seller?.name}
              className="w-6 h-6 rounded-full object-cover border border-gray-100"
            />
            <span className="text-xs text-gray-600 font-medium">{listing.seller?.name}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
