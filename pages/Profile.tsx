import React, { useEffect, useState } from 'react';
import { Settings, LogOut, HelpCircle, User, MapPin, Star, ChevronRight, Package } from 'lucide-react';
import ListingCard from '../components/ListingCard';
import { Listing, AppUser } from '../types/database';
import { generateMockListings } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AppUser | null>(null);
  const [myListings, setMyListings] = useState<Listing[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      // 1. Get authenticated user
      const { data: { user: authUser } } = await supabase.auth.getUser();

      // If we are in real mode and no user, redirect (or for demo, fallback to mock)
      if (!authUser) {
        // If robust env, redirect
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
          // navigate('/'); // Commented out for smoother demo flow if not logged in
          // For now, load mock user if not logged in so page isn't broken
          const mockUser: AppUser = {
            id: 'current-user',
            name: 'Bob Builder (Demo)',
            city: 'Florence',
            zip: '41042',
            reputation_score: 4.9,
            karma_points: 350,
            avatar_url: 'https://i.pravatar.cc/150?u=BobBuilder'
          };
          setUser(mockUser);

          // Mock Listings
          const allListings = generateMockListings() as Listing[];
          setMyListings(allListings.slice(2, 5));
          return;
        }
      }

      if (authUser) {
        // 2. Fetch app_user profile
        const { data: profile, error } = await supabase
          .from('app_user')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (error || !profile) {
          // Fallback to basic info from Auth if profile row missing
          setUser({
            id: authUser.id,
            name: authUser.email?.split('@')[0] || 'User',
            city: 'Unknown',
            zip: '00000',
            reputation_score: 0,
            karma_points: 0,
            avatar_url: `https://ui-avatars.com/api/?name=${authUser.email}`
          });
        } else {
          setUser(profile);
        }

        // 3. Fetch user's listings
        const { data: userListings } = await supabase
          .from('listing')
          .select('*, images:listing_media(*)')
          .eq('seller_id', authUser.id)
          .eq('status', 'ACTIVE')
          .order('created_at', { ascending: false });

        setMyListings(userListings || []);
      } else {
        // Fallback Mock (Redundant safety)
        const mockUser: AppUser = {
          id: 'current-user',
          name: 'Bob Builder',
          city: 'Florence',
          zip: '41042',
          reputation_score: 4.9,
          karma_points: 350,
          avatar_url: 'https://i.pravatar.cc/150?u=BobBuilder'
        };
        setUser(mockUser);
        const allListings = generateMockListings() as Listing[];
        setMyListings(allListings.slice(2, 5));
      }
    };

    loadProfile();
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white p-6 pb-8 rounded-b-[2.5rem] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary-100 to-primary-200 opacity-50"></div>

        <div className="relative pt-8 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full p-1 bg-white shadow-lg mb-3">
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
            />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h1>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{user.city}, KY</span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-gray-900">{user.reputation_score}</span>
              <span className="text-gray-400">(42)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            <div className="bg-gray-50 p-3 rounded-2xl text-center border border-gray-100">
              <div className="text-2xl font-bold text-gray-900">{user.karma_points}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Karma Pts</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-2xl text-center border border-gray-100">
              <div className="text-2xl font-bold text-gray-900">{myListings.length}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active Listings</div>
            </div>
          </div>
        </div>
      </div>

      {/* My Listings Section */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-gray-900">My Listings</h2>
          <button className="text-primary-600 text-sm font-semibold">See All</button>
        </div>

        {myListings.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
            {myListings.map(listing => (
              <div key={listing.id} className="min-w-[160px] w-[160px]">
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-6 text-center">
            <Package className="mx-auto text-gray-300 mb-2" size={32} />
            <p className="text-sm text-gray-500 mb-3">You haven't listed anything yet.</p>
            <button onClick={() => navigate('/sell')} className="text-primary-600 text-sm font-bold">Start Selling</button>
          </div>
        )}
      </div>

      {/* Menu Actions */}
      <div className="px-6 pb-8">
        <h2 className="font-bold text-lg text-gray-900 mb-4">Account</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
          <MenuItem
            icon={<User size={20} />}
            label="Edit Profile"
            onClick={() => navigate('/profile/edit')}
          />
          <MenuItem
            icon={<Settings size={20} />}
            label="Settings"
            onClick={() => navigate('/settings')}
          />
          <MenuItem
            icon={<HelpCircle size={20} />}
            label="Help & Support"
            onClick={() => navigate('/support')}
          />
          <MenuItem
            icon={<LogOut size={20} />}
            label="Log Out"
            isDestructive
            onClick={async () => {
              await supabase.auth.signOut();
              navigate('/');
            }}
          />
        </div>

        <p className="text-center text-xs text-gray-400 mt-8 mb-4">
          Version 1.0.0 (Beta)
        </p>
      </div>
    </div>
  );
};

const MenuItem = ({ icon, label, isDestructive, onClick }: { icon: React.ReactNode, label: string, isDestructive?: boolean, onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${isDestructive ? 'text-red-500' : 'text-gray-700'}`}
  >
    <div className="flex items-center gap-3">
      <span className={isDestructive ? 'text-red-500' : 'text-gray-400'}>{icon}</span>
      <span className="font-medium text-sm">{label}</span>
    </div>
    <ChevronRight size={16} className="text-gray-300" />
  </button>
);

export default Profile;