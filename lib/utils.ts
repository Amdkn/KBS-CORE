import { ListingType, Circle } from '../types/database';

export const formatPrice = (cents: number, type: ListingType): string => {
  if (type === 'DONATION') return 'FREE';
  if (type === 'TRADE') return 'TRADE';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
};

export const getPlaceholderImage = (seed: string) => {
  return `https://picsum.photos/seed/${seed}/400/400`;
};

// Mock Circles
export const generateMockCircles = (): Circle[] => {
  return [
    { id: 'c1', name: 'Brooklyn, NY', zip_center: '11201', image_url: '' },
    { id: 'c2', name: 'Florence, KY', zip_center: '41042', image_url: '' },
    { id: 'c3', name: 'Cincinnati Downtown', zip_center: '45202', image_url: '' },
    { id: 'c4', name: 'Hyde Park, OH', zip_center: '45208', image_url: '' },
  ];
};

// Mock data generator since we don't have live DB connection
export const generateMockListings = () => {
  // Logic to generate mock listings for the UI
  // Assigning random circle_ids to mock filtering
  return [
    {
      id: '1',
      title: 'Wooden Chair',
      price_cents: 2500,
      type: 'SALE',
      description: 'Solid oak chair, mid-century modern style. Great condition.',
      condition: 'Used - Good',
      seller: { id: 'u1', name: 'Sarah L.', avatar_url: 'https://i.pravatar.cc/150?u=1' },
      images: [{ id: 'm1', storage_path: 'https://images.unsplash.com/photo-1503602642458-232111445857?auto=format&fit=crop&q=80&w=500' }],
      distance: 0.8,
      circle_id: 'c1' // Brooklyn
    },
    {
      id: '2',
      title: 'Ceramic Vase',
      price_cents: 0,
      type: 'DONATION',
      description: 'Handmade ceramic vase. White matte finish. Moving out so giving it away.',
      condition: 'Like New',
      seller: { id: 'u2', name: 'Mike R.', avatar_url: 'https://i.pravatar.cc/150?u=2' },
      images: [{ id: 'm2', storage_path: 'https://images.unsplash.com/photo-1581783342308-f792ca11df53?auto=format&fit=crop&q=80&w=500' }],
      distance: 1.2,
      circle_id: 'c1' // Brooklyn
    },
    {
      id: '3',
      title: 'MCM Armchair',
      price_cents: 15000,
      type: 'SALE',
      description: 'Original 1960s armchair. Reupholstered last year. Super comfortable.',
      condition: 'Used - Good',
      seller: { id: 'current-user', name: 'Bob Builder', avatar_url: 'https://i.pravatar.cc/150?u=BobBuilder' },
      images: [{ id: 'm3', storage_path: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=500' }],
      distance: 2.5,
      circle_id: 'c2' // Florence
    },
    {
      id: '4',
      title: 'Floor Lamp',
      price_cents: 0,
      type: 'DONATION',
      description: 'Works perfectly but I bought a new one. Pick up only.',
      condition: 'Used - Fair',
      seller: { id: 'current-user', name: 'Bob Builder', avatar_url: 'https://i.pravatar.cc/150?u=BobBuilder' },
      images: [{ id: 'm4', storage_path: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=500' }],
      distance: 0.5,
      circle_id: 'c2' // Florence
    },
    {
      id: '5',
      title: 'Vintage Leather Jacket',
      price_cents: 7500,
      type: 'SALE',
      description: 'Classic brown leather jacket in great condition. Shows some minor signs of wear which add to its vintage character. No tears or major scuffs. All zippers and buttons are functional. Selling because it no longer fits.',
      condition: 'Used - Good',
      seller: { id: 'u5', name: 'Jane Doe', avatar_url: 'https://i.pravatar.cc/150?u=5' },
      images: [{ id: 'm5', storage_path: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&q=80&w=500' }],
      distance: 3.0,
      circle_id: 'c3' // Cincinnati
    },
    {
        id: '6',
        title: 'Mountain Bike',
        price_cents: 12000,
        type: 'SALE',
        description: 'Trek Marlin 5. Good condition, just tuned up.',
        condition: 'Used - Good',
        seller: { id: 'u6', name: 'Alex M.', avatar_url: 'https://i.pravatar.cc/150?u=6' },
        images: [{ id: 'm6', storage_path: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&q=80&w=500' }],
        distance: 1.5,
        circle_id: 'c4' // Hyde Park
    }
  ];
};