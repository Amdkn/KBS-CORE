import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown, Check, X } from 'lucide-react';
import { Circle } from '../types/database';
import { generateMockCircles } from '../lib/utils';

interface LocationPickerProps {
  selectedCircle: Circle | null;
  onSelect: (circle: Circle) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ selectedCircle, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [circles, setCircles] = useState<Circle[]>([]);

  useEffect(() => {
    // In real app, fetch from Supabase
    setCircles(generateMockCircles());
  }, []);

  const handleSelect = (circle: Circle) => {
    onSelect(circle);
    setIsOpen(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-gray-800 hover:bg-gray-100 px-3 py-1.5 rounded-full transition-colors -ml-2"
      >
        <MapPin className="text-primary-600 fill-current" size={20} />
        <span className="font-bold text-lg truncate max-w-[160px]">
          {selectedCircle ? selectedCircle.name : 'Select Location'}
        </span>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {/* Bottom Sheet / Modal */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 animate-in slide-in-from-bottom duration-300 max-w-md mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Choose Location</h3>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {circles.map(circle => (
                <button
                  key={circle.id}
                  onClick={() => handleSelect(circle)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                    selectedCircle?.id === circle.id
                      ? 'bg-primary-50 border border-primary-200 shadow-sm'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className={`p-2 rounded-full ${selectedCircle?.id === circle.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                        <MapPin size={20} />
                    </div>
                    <div>
                        <div className={`font-bold ${selectedCircle?.id === circle.id ? 'text-primary-900' : 'text-gray-900'}`}>
                            {circle.name}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                            {circle.zip_center} Area
                        </div>
                    </div>
                  </div>
                  {selectedCircle?.id === circle.id && (
                    <div className="bg-primary-500 text-white p-1 rounded-full">
                        <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">Can't find your community? <span className="text-primary-600 font-bold">Request a new Hub</span></p>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default LocationPicker;