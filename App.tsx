import React from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import HomeFeed from './src_pages/HomeFeed';
import ItemDetail from './src_pages/ItemDetail';
import SellFlow from './src_pages/SellFlow';
import Saved from './src_pages/Saved';
import Messages from './src_pages/Messages';
import ChatDetail from './src_pages/ChatDetail';
import Profile from './src_pages/Profile';
import EditProfile from './src_pages/EditProfile';
import Settings from './src_pages/Settings';
import Support from './src_pages/Support';
import Auth from './src_pages/Auth';
import BottomNav from './components/BottomNav';

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  
  // Hide bottom nav on detail, sell, auth pages, AND chat detail
  // Logic: Hide if:
  // 1. /items/ anything
  // 2. /sell
  // 3. / (Auth)
  // 4. /messages/ anything (but not /messages exactly)
  // 5. /profile/edit, /settings, /support (sub-pages)
  const isChatDetail = location.pathname.startsWith('/messages/') && location.pathname !== '/messages';
  const isProfileSubPage = location.pathname === '/profile/edit' || location.pathname === '/settings' || location.pathname === '/support';
  
  const hideNav = location.pathname.includes('/items/') || location.pathname === '/sell' || location.pathname === '/' || isChatDetail || isProfileSubPage;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 relative shadow-2xl overflow-hidden flex flex-col">
      <div className={`flex-1 ${!hideNav ? 'pb-24' : ''}`}>
        {children}
      </div>
      {!hideNav && <BottomNav />}
    </div>
  );
};

const App = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/home" element={<HomeFeed />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:id" element={<ChatDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/support" element={<Support />} />
          <Route path="/items/:id" element={<ItemDetail />} />
          <Route path="/sell" element={<SellFlow />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;