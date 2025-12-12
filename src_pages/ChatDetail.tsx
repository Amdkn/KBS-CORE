import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Phone, Info } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Message, AppUser } from '../types/database';

const ChatDetail = () => {
  const { id } = useParams(); // conversationId
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Hardcoded current user for demo
  const currentUserId = 'current-user';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial Fetch & Realtime Subscription
  useEffect(() => {
    if (!id) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        // 1. Fetch Conversation Details (to get other user info)
        // Mocking user fetch since we don't have full auth/user table access in this demo
        // In real app: const { data: conv } = await supabase.from('conversation').select('*, participant2:app_user(...)')...
        setOtherUser({
            id: 'u2',
            name: 'Alice Baker',
            avatar_url: 'https://i.pravatar.cc/150?u=Alice',
            city: 'Brooklyn',
            zip: '11201',
            reputation_score: 5.0,
            karma_points: 200
        });

        // 2. Fetch Messages
        const { data, error } = await supabase
          .from('message')
          .select('*')
          .eq('conversation_id', id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (err) {
        console.warn("Using mock messages due to fetch error:", err);
        setMessages([
            { id: 'm1', conversation_id: id, sender_id: 'u2', content: 'Hi! Is the item still available?', created_at: new Date(Date.now() - 100000).toISOString(), is_read: true },
            { id: 'm2', conversation_id: id, sender_id: 'current-user', content: 'Yes it is! When would you like to pick it up?', created_at: new Date(Date.now() - 80000).toISOString(), is_read: true },
            { id: 'm3', conversation_id: id, sender_id: 'u2', content: 'Does tomorrow at 5pm work for you?', created_at: new Date(Date.now() - 60000).toISOString(), is_read: true },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // 3. Realtime Subscription
    const channel = supabase
      .channel(`chat:${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'message', filter: `conversation_id=eq.${id}` },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id) return;

    const tempId = Math.random().toString(36).substr(2, 9);
    const msgToSend = {
      conversation_id: id,
      sender_id: currentUserId,
      content: newMessage.trim(),
    };

    // Optimistic UI update
    const optimisticMsg: Message = {
      ...msgToSend,
      id: tempId,
      created_at: new Date().toISOString(),
      is_read: false
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setNewMessage('');

    try {
      const { error } = await supabase
        .from('message')
        .insert(msgToSend);

      if (error) throw error;
      
      // Also update conversation last_message
      await supabase
        .from('conversation')
        .update({ 
            last_message: msgToSend.content,
            last_message_at: new Date().toISOString()
        })
        .eq('id', id);

    } catch (err) {
      console.error("Failed to send message:", err);
      // In production, we'd show an error state on the message
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md px-4 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full -ml-2">
            <ArrowLeft size={22} className="text-gray-700" />
          </button>
          
          {loading ? (
             <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
          ) : (
             <div className="flex items-center gap-3">
                <div className="relative">
                    <img 
                    src={otherUser?.avatar_url} 
                    alt={otherUser?.name} 
                    className="w-10 h-10 rounded-full object-cover border border-gray-100"
                    />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                    <h2 className="font-bold text-gray-900 leading-tight">{otherUser?.name}</h2>
                    <p className="text-xs text-green-600 font-medium">Online</p>
                </div>
             </div>
          )}
        </div>

        <div className="flex gap-2">
            <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full">
                <Phone size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full">
                <Info size={20} />
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm text-sm ${
                        isMe 
                        ? 'bg-primary-400 text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                    }`}>
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-100' : 'text-gray-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
            );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 sticky bottom-0 z-20">
        <div className="flex items-end gap-2 bg-gray-50 rounded-[2rem] p-1.5 border border-gray-200 focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-300 transition-all shadow-sm">
            <input
                className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 max-h-32 min-h-[44px] outline-none text-gray-800 placeholder:text-gray-400 resize-none"
                placeholder="Message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
            />
            <button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 disabled:hover:bg-primary-500 transition-all shadow-md shadow-primary-200"
            >
                <Send size={18} className="ml-0.5" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatDetail;