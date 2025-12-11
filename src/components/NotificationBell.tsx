import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Info, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Notification } from '../types/database';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();

    // Subscribe to realtime notifications
    // Note: Assuming 'notification' table exists. 
    // Fallback to mock for demo.
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notification' }, payload => {
        const newNotif = payload.new as Notification;
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    // Mock Data for Demo since we might not have the table
    const mockData: Notification[] = [
      { id: '1', user_id: 'me', type: 'MESSAGE', title: 'New Message', message: 'Alice Baker sent you a message.', is_read: false, created_at: new Date().toISOString(), link: '/messages/1' },
      { id: '2', user_id: 'me', type: 'SYSTEM', title: 'Welcome to KBS', message: 'Thanks for joining our community!', is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() }
    ];
    setNotifications(mockData);
    setUnreadCount(mockData.filter(n => !n.is_read).length);
  };

  const handleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    // In real app, update DB: await supabase.from('notification').update({ is_read: true }).eq('id', id);
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'MESSAGE': return <MessageSquare size={16} className="text-blue-500" />;
      case 'TRANSACTION': return <CheckCircle size={16} className="text-green-500" />;
      default: return <Info size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-3 border-b border-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
              <button onClick={() => setNotifications([])} className="text-xs text-primary-600 font-medium">Clear All</button>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    onClick={() => handleRead(notif.id)}
                    className={`p-3 flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0 ${notif.is_read ? 'opacity-60' : 'bg-blue-50/30'}`}
                  >
                    <div className="mt-1 flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                      {getIcon(notif.type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{notif.title}</h4>
                      <p className="text-xs text-gray-600 leading-snug mt-0.5">{notif.message}</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No notifications
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;