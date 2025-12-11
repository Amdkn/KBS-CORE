import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import AvatarUpload from '../components/AvatarUpload';
import { AppUser } from '../types/database';

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // Mock user fetch for demo, replacing with real fetch if available
      // const { data: { user } } = await supabase.auth.getUser();
      // const { data } = await supabase.from('app_user').select('*').eq('id', user.id).single();
      
      // Simulating data for now
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
      setName(mockUser.name);
      setCity(mockUser.city);
      setZip(mockUser.zip);
      setAvatarUrl(mockUser.avatar_url);

    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Logic to update Supabase
      /*
      const { error } = await supabase
        .from('app_user')
        .update({
          name,
          city,
          zip,
          avatar_url: avatarUrl,
        })
        .eq('id', user?.id);
      if (error) throw error;
      */
     
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success feedback would go here (toast)
      navigate('/profile');
    } catch (error) {
      alert('Error updating profile!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-4 sticky top-0 bg-white z-10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full -ml-2">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
      </div>

      <form onSubmit={handleSave} className="p-6">
        {/* Avatar Section */}
        <div className="flex justify-center mb-8">
          <AvatarUpload 
            url={avatarUrl} 
            onUpload={(url) => setAvatarUrl(url)} 
            size={120}
          />
        </div>

        {/* Fields */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-400 outline-none transition-all"
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
              <input 
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                placeholder="City"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Zip Code</label>
              <input 
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                placeholder="Zip"
                required
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
          <button 
            type="submit"
            disabled={saving}
            className="w-full bg-primary-500 text-white font-bold py-4 rounded-full hover:bg-primary-600 transition-colors shadow-lg shadow-primary-200 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Saving...
              </>
            ) : (
              <>
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;