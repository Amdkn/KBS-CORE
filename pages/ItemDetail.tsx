import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, ShieldCheck, ChevronRight } from 'lucide-react';
import { generateMockListings, formatPrice } from '../lib/utils';
import { Listing } from '../types/database';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<Listing | null>(null);

  useEffect(() => {
    const all = generateMockListings() as any;
    const found = all.find((l: any) => l.id === id);
    setItem(found || all[0]); // Fallback to first item if not found for demo
  }, [id]);

  if (!item) return <div className="p-8 text-center">Loading...</div>;

  const isDonation = item.type === 'DONATION';

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md px-4 py-3 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-semibold text-lg">Details</h1>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <Heart size={24} />
        </button>
      </div>

      {/* Image */}
      <div className="pt-16 pb-6 px-4">
        <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100 shadow-sm relative">
             <img 
               src={item.images?.[0]?.storage_path} 
               alt={item.title} 
               className="w-full h-full object-cover"
             />
        </div>
      </div>

      {/* Info */}
      <div className="px-5">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{item.title}</h1>
        <h2 className={`text-xl font-bold mb-4 ${isDonation ? 'text-primary-600' : 'text-gray-900'}`}>
          {formatPrice(item.price_cents, item.type)}
        </h2>

        <div className="flex gap-3 mb-6">
          <span className="px-4 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
            {item.condition}
          </span>
          {isDonation && (
            <span className="px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium flex items-center gap-1">
              <Heart size={14} className="fill-current" /> Donation Eligible
            </span>
          )}
        </div>

        {/* Seller Card */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={item.seller?.avatar_url} alt="Seller" className="w-12 h-12 rounded-full object-cover" />
            <div>
              <h3 className="font-bold text-gray-900">{item.seller?.name}</h3>
              <div className="flex items-center gap-1 text-yellow-500 text-sm">
                <span>★</span>
                <span className="text-gray-600">5.0 (120 Reviews)</span>
              </div>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </div>

        {/* Description */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-600 leading-relaxed">
            {item.description}
          </p>
        </div>
        
        {/* Antifragile: Safety Notice */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-8">
             <ShieldCheck className="text-primary-600 flex-shrink-0" size={24} />
             <p className="text-xs text-gray-500">
                 KBS transactions are community protected. Payment is held until you confirm receipt.
             </p>
        </div>
      </div>

      {/* Sticky Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex flex-col gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
        {!isDonation && (
          <button className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-full hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200">
            Buy for {formatPrice(item.price_cents, item.type)}
          </button>
        )}
        
        <button className="w-full bg-slate-600 text-white font-bold py-3.5 rounded-full hover:bg-slate-700 transition-colors shadow-lg shadow-gray-200">
          Propose a Trade
        </button>

        {isDonation && (
             <button className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-full hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200">
             Request Item
           </button>
        )}
      </div>
    </div>
  );
};

export default ItemDetail;
