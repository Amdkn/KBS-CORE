import React, { useState } from 'react';
import { X } from 'lucide-react';

export interface FilterState {
  distance: number;
  priceMin: string;
  priceMax: string;
  condition: string[];
  sortBy: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters: FilterState;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply, initialFilters }) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  if (!isOpen) return null;

  const conditions = ['New', 'Like New', 'Used - Good', 'Used - Fair', 'For Parts'];
  const sortOptions = [
    { id: 'newest', label: 'Newest Listed' },
    { id: 'closest', label: 'Closest Distance' },
    { id: 'price_asc', label: 'Price: Low to High' },
    { id: 'price_desc', label: 'Price: High to Low' },
  ];

  const handleConditionToggle = (c: string) => {
    setFilters(prev => {
      const exists = prev.condition.includes(c);
      if (exists) return { ...prev, condition: prev.condition.filter(item => item !== c) };
      return { ...prev, condition: [...prev.condition, c] };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 duration-300 max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Filters</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Distance */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="font-bold text-gray-700">Distance</label>
              <span className="text-primary-600 font-bold">{filters.distance} miles</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="50" 
              value={filters.distance}
              onChange={(e) => setFilters({...filters, distance: parseInt(e.target.value)})}
              className="w-full accent-primary-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1 mi</span>
              <span>50 mi</span>
            </div>
          </div>

          {/* Price Range */}
          <div>
             <label className="block font-bold text-gray-700 mb-3">Price Range</label>
             <div className="flex gap-4 items-center">
               <div className="relative flex-1">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                 <input 
                    type="number" 
                    placeholder="Min"
                    value={filters.priceMin}
                    onChange={(e) => setFilters({...filters, priceMin: e.target.value})}
                    className="w-full pl-7 pr-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-400 outline-none"
                 />
               </div>
               <span className="text-gray-400">-</span>
               <div className="relative flex-1">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                 <input 
                    type="number" 
                    placeholder="Max"
                    value={filters.priceMax}
                    onChange={(e) => setFilters({...filters, priceMax: e.target.value})}
                    className="w-full pl-7 pr-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-400 outline-none"
                 />
               </div>
             </div>
          </div>

          {/* Condition */}
          <div>
            <label className="block font-bold text-gray-700 mb-3">Condition</label>
            <div className="flex flex-wrap gap-2">
              {conditions.map(c => (
                <button
                  key={c}
                  onClick={() => handleConditionToggle(c)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    filters.condition.includes(c)
                    ? 'bg-primary-100 border-primary-200 text-primary-800'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block font-bold text-gray-700 mb-3">Sort By</label>
            <div className="space-y-2">
              {sortOptions.map(option => (
                <label key={option.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <input 
                    type="radio" 
                    name="sort"
                    checked={filters.sortBy === option.id}
                    onChange={() => setFilters({...filters, sortBy: option.id})}
                    className="w-5 h-5 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="text-gray-700 font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-100 flex gap-3">
          <button 
             onClick={() => setFilters({ distance: 10, priceMin: '', priceMax: '', condition: [], sortBy: 'newest' })}
             className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl"
          >
            Reset
          </button>
          <button 
             onClick={() => onApply(filters)}
             className="flex-[2] py-3 bg-primary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-200 hover:bg-primary-600"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;