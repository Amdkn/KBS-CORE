import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import AuthForm from '../components/AuthForm';
import { ShieldCheck, Sparkles, Heart, Star } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if session exists, if so redirect to home
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/home');
      }
    };
    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      
      {/* Top Banner: Social Proof / Scarcity */}
      <div className="w-full bg-primary-600 text-white text-xs font-bold py-2 px-4 text-center">
        🚀 Beta Access: Join 500+ locals in Ohio & Kentucky trading today!
      </div>

      <div className="w-full max-w-4xl mx-auto px-6 py-8 flex-1 flex flex-col md:flex-row items-center gap-12">
        
        {/* Left Side: The "Offer" Copy */}
        <div className="flex-1 text-center md:text-left space-y-8">
          <div>
            <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold mb-4">
              <Star size={12} className="fill-green-700" />
              #1 Secure Marketplace
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              Turn Clutter into <br/>
              <span className="text-primary-500">Cash & Good Karma.</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed">
              The antifragile marketplace for the Circular Economy. 
              List in 60s with AI. Verified locals only.
            </p>
          </div>

          {/* Value Stack */}
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Sparkles size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900">Sell in Seconds, Not Minutes</h3>
                <p className="text-sm text-gray-500">Our AI writes the listing for you. Just snap a photo. Get paid instantly.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <ShieldCheck size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900">Buy with 100% Confidence</h3>
                <p className="text-sm text-gray-500">Verified IDs only. Money-back guarantee if the item isn't as described.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <Heart size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900">Give Back & Earn Fame</h3>
                <p className="text-sm text-gray-500">Donate items effortlessly. Earn Karma Points and build your local reputation.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: The Form */}
        <div className="w-full max-w-md">
          <AuthForm />
          
          <p className="text-xs text-center text-gray-400 mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy.
            <br/>All transactions are secure and encrypted.
          </p>
        </div>
      </div>
      
      {/* Footer / Trust Signals */}
      <div className="w-full bg-white border-t border-gray-100 py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-6 flex justify-between items-center text-gray-400 text-sm">
          <span className="font-bold">KBS Marketplace © 2024</span>
          <div className="flex gap-4">
            <span>Secure Escrow</span>
            <span>•</span>
            <span>ID Verified</span>
            <span>•</span>
            <span>Local Only</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;