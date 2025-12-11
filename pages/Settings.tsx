import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Mail, Moon, Trash2, ChevronRight, Shield } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      alert("Account deletion simulated. Redirecting to home.");
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
       {/* Header */}
       <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-4 bg-white sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full -ml-2">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="p-6 space-y-8">
        {/* Preferences Section */}
        <section>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">Preferences</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {/* Push Notifications */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Bell size={20} />
                </div>
                <span className="font-medium text-gray-900">Push Notifications</span>
              </div>
              <Toggle checked={pushEnabled} onChange={() => setPushEnabled(!pushEnabled)} />
            </div>

            {/* Email Alerts */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Mail size={20} />
                </div>
                <span className="font-medium text-gray-900">Email Alerts</span>
              </div>
              <Toggle checked={emailEnabled} onChange={() => setEmailEnabled(!emailEnabled)} />
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                  <Moon size={20} />
                </div>
                <span className="font-medium text-gray-900">Dark Mode</span>
              </div>
              <Toggle checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
            </div>
          </div>
        </section>

        {/* Privacy & Safety */}
         <section>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">Privacy</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
             <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                  <Shield size={20} />
                </div>
                <span className="font-medium text-gray-900">Privacy Policy</span>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <h2 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4 px-1">Danger Zone</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
            <button 
              onClick={handleDeleteAccount}
              className="w-full flex items-center gap-3 p-4 hover:bg-red-50 transition-colors text-red-600"
            >
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 size={20} />
              </div>
              <span className="font-bold">Delete Account</span>
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 px-1">
            Permanently remove your account and all listing data.
          </p>
        </section>
      </div>
    </div>
  );
};

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button 
    onClick={onChange}
    className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${checked ? 'bg-primary-500' : 'bg-gray-200'}`}
  >
    <div 
      className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} 
    />
  </button>
);

export default Settings;