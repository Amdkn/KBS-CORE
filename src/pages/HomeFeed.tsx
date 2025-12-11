import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Search, RotateCcw, Plus } from 'lucide-react';
import ListingCard from '../components/ListingCard';
import { Listing, Circle } from '../types/database';
import { generateMockListings, generateMockCircles } from '../lib/utils';
import FilterModal, { FilterState } from '../components/FilterModal';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import NotificationBell from '../components/NotificationBell';
import StoriesTray from '../components/StoriesTray';
import LocationPicker from '../components/LocationPicker';

const HomeFeed = () => {
  // Data State
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);

  // Location State
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);
  const [circles, setCircles] = useState<Circle[]>([]);

  // UI State
  const [activeChip, setActiveChip] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    distance: 25, // Default larger distance
    priceMin: '',
    priceMax: '',
    condition: [],
    sortBy: 'newest'
  });

  // Initial Load: Circles & Listings
  useEffect(() => {
    const loadData = async () => {
      // 1. Load Circles
      let circles: Circle[] = [];

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from('circle').select('*');
        circles = (!error && data && data.length > 0) ? data : generateMockCircles();
      } else {
        circles = generateMockCircles();
      }

      setCircles(circles); // Keep local state of circles if needed, or just use for selection logic

      const savedCircleId = localStorage.getItem('kbs_preferred_circle');
      const selected = savedCircleId
        ? circles.find(c => c.id === savedCircleId) || circles[0]
        : circles[0];
      setSelectedCircle(selected);

      // 2. Load Listings (based on circle)
      // Pass the selected ID directly to avoid stale state issues in this closure
      await fetchListings(selected?.id);
    };

    loadData();
  }, []);

  // Fetch Listings Helper
  const fetchListings = async (circleId?: string) => {
    if (!isSupabaseConfigured()) {
      const mockData = generateMockListings() as Listing[];
      setListings(mockData);
      return;
    }

    try {
      let query = supabase
        .from('listing')
        .select(`
            *,
            seller:seller_id(*),
            images:listing_media(*)
        `)
        .eq('status', 'ACTIVE'); // Assuming status logic exists

      if (circleId) {
        query = query.eq('circle_id', circleId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch error, using mock data:', error);
        setListings(generateMockListings() as Listing[]);
      } else {
        // Map Supabase response to match Listing type structure if needed
        // The select query `seller:seller_id(*)` might return an object or array depending on relation type
        // Verify if your DB types expect `seller` property to be populated objects

        // For now, assuming the join works as expected. If not, fallback might be safer.
        // If data is empty but no error, it just means no listings, which is valid.
        setListings(data && data.length > 0 ? data : []);

        // If we got 0 real results in a "clean" environment, maybe we still want mock data for the demo?
        // The prompt asks for fallback if error OR empty? "If Supabase returns an error (or is empty), keep the mock data"
        if (!data || data.length === 0) {
          console.log("No live data found, falling back to mock for demo experience");
          setListings(generateMockListings() as Listing[]);
        }
      }
    } catch (err) {
      console.error("Fetch Exception:", err);
      setListings(generateMockListings() as Listing[]);
    }
  };

  // Handle Location Selection
  const handleLocationSelect = (circle: Circle) => {
    setSelectedCircle(circle);
    localStorage.setItem('kbs_preferred_circle', circle.id);
    fetchListings(circle.id);
  };

  // Main Filtering Logic
  useEffect(() => {
    if (!selectedCircle) return;

    if (!isSupabaseConfigured()) {
      // Fallback Client-Side Filtering (Mock)
      let result = [...listings];
      if (selectedCircle) {
        result = result.filter(l => l.circle_id === selectedCircle.id);
      }
      if (activeChip !== 'All') {
        if (activeChip === 'Donation') result = result.filter(l => l.type === 'DONATION');
        else if (activeChip === 'Trade') result = result.filter(l => l.type === 'TRADE');
        else if (activeChip === 'For Sale') result = result.filter(l => l.type === 'SALE');
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        result = result.filter(l => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q));
      }
      // 3. Modal Filters
      // Distance 
      if (filters.distance) {
        result = result.filter(l => (l.distance || 0) <= filters.distance);
      }

      // Price
      if (filters.priceMin) {
        const min = parseFloat(filters.priceMin) * 100; // cents
        result = result.filter(l => l.price_cents >= min);
      }
      if (filters.priceMax) {
        const max = parseFloat(filters.priceMax) * 100; // cents
        result = result.filter(l => l.price_cents <= max);
      }

      // Condition
      if (filters.condition.length > 0) {
        result = result.filter(l => filters.condition.includes(l.condition));
      }

      // Sort
      if (filters.sortBy === 'price_asc') {
        result.sort((a, b) => a.price_cents - b.price_cents);
      } else if (filters.sortBy === 'price_desc') {
        result.sort((a, b) => b.price_cents - a.price_cents);
      } else if (filters.sortBy === 'closest') {
        result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }
      setFilteredListings(result);
      return;
    }

    // Server-Side Filtering (Supabase)
    const applyServerFilters = async () => {
      let query = supabase
        .from('listing')
        .select('*, seller:seller_id(*), images:listing_media(*)')
        .eq('status', 'ACTIVE')
        .eq('circle_id', selectedCircle.id);

      // Chip Filter
      if (activeChip === 'For Sale') query = query.eq('type', 'SALE');
      else if (activeChip === 'Trade') query = query.eq('type', 'TRADE');
      else if (activeChip === 'Donation') query = query.eq('type', 'DONATION');

      // Search
      if (searchQuery.trim()) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      // Price/Distance/Condition would ideally be server-side too but for MVP 
      // we can filter the result set or add more query params if easy.
      // Let's stick to basic filters for server and do refinement on client if needed OR expand query.

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.warn("Filter fetch failed", error);
        // Maintain current list if error
      } else {
        // Apply client-side refinements (Distance, Price range from modal)
        let result = data || [];

        // ... Re-apply modal filters client side for V0.1 simplicity on top of server data
        if (filters.distance) result = result.filter(l => (l.distance || 0) <= filters.distance);
        if (filters.priceMin) result = result.filter(l => l.price_cents >= parseFloat(filters.priceMin) * 100);
        if (filters.priceMax) result = result.filter(l => l.price_cents <= parseFloat(filters.priceMax) * 100);
        if (filters.condition.length > 0) result = result.filter(l => filters.condition.includes(l.condition));

        // Sort
        if (filters.sortBy === 'price_asc') {
          result.sort((a, b) => a.price_cents - b.price_cents);
        } else if (filters.sortBy === 'price_desc') {
          result.sort((a, b) => b.price_cents - a.price_cents);
        } else if (filters.sortBy === 'closest') {
          result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }

        setFilteredListings(result);
      }
    };

    applyServerFilters();

  }, [listings, activeChip, searchQuery, filters, selectedCircle]);

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    setIsFilterModalOpen(false);
  };

  return (
    <div className="pb-24 pt-4 px-4 min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <LocationPicker
          selectedCircle={selectedCircle}
          onSelect={handleLocationSelect}
        />
        <NotificationBell />
      </header>

      {/* Search Bar */}
      <div className="flex gap-3 mb-8 sticky top-4 z-20">
        <div className="flex-1 relative shadow-sm rounded-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search in ${selectedCircle?.name.split(',')[0]}...`}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-full border-none focus:ring-2 focus:ring-primary-400 outline-none text-gray-700 transition-shadow"
          />
        </div>
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="bg-white p-3 rounded-full shadow-sm text-gray-700 hover:text-primary-600 transition-colors"
        >
          <SlidersHorizontal size={24} />
        </button>
      </div>

      {/* Stories / Community Hub */}
      <StoriesTray currentCircleId={selectedCircle?.id} />

      {/* Filter Chips */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar mt-2">
        {['All', 'For Sale', 'Trade', 'Donation'].map(chip => (
          <button
            key={chip}
            onClick={() => setActiveChip(chip)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${activeChip === chip
              ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-transparent'
              }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Grid Content */}
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">
          {filteredListings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
            <Search size={40} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-500 max-w-[250px] mb-8">
            Be the first to list something in <span className="font-bold text-gray-800">{selectedCircle?.name}</span>!
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={() => {
                setActiveChip('All');
                setSearchQuery('');
                setFilters({ distance: 25, priceMin: '', priceMax: '', condition: [], sortBy: 'newest' });
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <RotateCcw size={18} />
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />
    </div>
  );
};

export default HomeFeed;