import React, { useEffect, useState } from 'react';
import { Search, MoreVertical, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Conversation, AppUser } from '../types/database';

const Messages = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user.id);
      } else {
        // For demo stability, if no user, we might mock a user ID or redirect
        if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
          setCurrentUser('current-user');
        } else {
          // navigate('/');
          // For V0.1 we can just stay on page but show nothing or mock
          setCurrentUser('current-user');
        }
      }
    };
    getUser();
  }, [navigate]);

  useEffect(() => {
    if (!currentUser) return;

    fetchConversations(currentUser);

    // Set up realtime subscription
    const channel = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation',
          filter: `participant1_id=eq.${currentUser}`
          // Note: Full bidirectional realtime needs more complex setup or 2 subscriptions
          // For V0.1 this proves the concept
        },
        (payload) => {
          console.log('Conversation update:', payload);
          fetchConversations(currentUser); // Re-fetch on any change
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  const fetchConversations = async (userId: string) => {
    try {
      // Real Fetch Logic
      // Note: In a real Supabase setup, we would join app_user to get details.
      // Since this is 2B iteration, we'll try to fetch, but fallback to mock if env keys aren't set.
      if (userId === 'current-user' && process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
        throw new Error("Demo Mode");
      }

      const { data, error } = await supabase
        .from('conversation')
        .select('*')
        .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (error || !data) throw error;

      // For demo purposes, we need to populate 'other_user' manually if we didn't do a complex join
      // We will try to fetch the other users
      const enriched = await Promise.all(data.map(async (c: any) => {
        const otherId = c.participant1_id === userId ? c.participant2_id : c.participant1_id;
        // Try fetch user
        let otherUser = {
          id: otherId,
          name: 'User ' + otherId.substring(0, 4),
          avatar_url: `https://ui-avatars.com/api/?name=${otherId}`,
          city: 'Unknown'
        } as AppUser;

        const { data: uData } = await supabase.from('app_user').select('*').eq('id', otherId).single();
        if (uData) otherUser = uData;

        return {
          ...c,
          other_user: otherUser
        };
      }));

      setConversations(enriched);
    } catch (err) {
      console.warn("Supabase fetch failed (likely missing keys), falling back to mock data.", err);
      // Fallback Mock Data
      setConversations([
        {
          id: '1',
          participant1_id: 'current-user',
          participant2_id: 'u2',
          last_message: 'Is this still available? I can pick it up today.',
          last_message_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 mins ago
          updated_at: new Date().toISOString(),
          other_user: {
            id: 'u2',
            name: 'Alice Baker',
            avatar_url: 'https://i.pravatar.cc/150?u=Alice',
            city: 'Brooklyn',
            zip: '11201',
            reputation_score: 5.0,
            karma_points: 200
          } as AppUser,
          unread_count: 1
        },
        {
          id: '2',
          participant1_id: 'u3',
          participant2_id: 'current-user',
          last_message: 'Thanks for the trade! The chair is perfect.',
          last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          updated_at: new Date().toISOString(),
          other_user: {
            id: 'u3',
            name: 'Charlie Solar',
            avatar_url: 'https://i.pravatar.cc/150?u=Charlie',
            city: 'Queens',
            zip: '11101',
            reputation_score: 4.5,
            karma_points: 50
          } as AppUser,
          unread_count: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000; // seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 py-4 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-10 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <button className="p-2 hover:bg-gray-50 rounded-full text-gray-500">
          <MoreVertical size={20} />
        </button>
      </header>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary-400 outline-none text-gray-700 text-sm"
          />
        </div>
      </div>

      {/* Conversation List */}
      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin text-primary-500" size={32} />
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => navigate(`/messages/${conv.id}`)}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
            >
              {/* Avatar */}
              <div className="relative">
                <img
                  src={conv.other_user?.avatar_url || 'https://via.placeholder.com/150'}
                  alt={conv.other_user?.name}
                  className="w-12 h-12 rounded-full object-cover border border-gray-100"
                />
                {/* Status Indicator (Mock) */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className={`font-semibold truncate ${conv.unread_count && conv.unread_count > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                    {conv.other_user?.name || 'Unknown User'}
                  </h3>
                  <span className={`text-xs ${conv.unread_count && conv.unread_count > 0 ? 'text-primary-600 font-bold' : 'text-gray-400'}`}>
                    {formatTime(conv.last_message_at)}
                  </span>
                </div>
                <p className={`text-sm truncate ${conv.unread_count && conv.unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                  {conv.last_message}
                </p>
              </div>

              {/* Unread Badge */}
              {conv.unread_count && conv.unread_count > 0 ? (
                <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                  {conv.unread_count}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;