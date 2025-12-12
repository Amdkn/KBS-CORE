import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Send, MessageCircle } from 'lucide-react';

const Support = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [message, setMessage] = useState('');

  const faqs = [
    {
      q: "How does the Karma system work?",
      a: "You earn Karma points for every successful transaction, positive review, and community donation. Higher Karma unlocks special badges and visibility boosts."
    },
    {
      q: "Is it safe to meet strangers?",
      a: "We recommend meeting in public places like coffee shops or police station trading zones. Always check the user's Reputation Score before meeting."
    },
    {
      q: "How do I process a return?",
      a: "Since this is a peer-to-peer marketplace, returns are up to the seller's discretion unless the item was misrepresented. Contact support if you believe you were scammed."
    },
    {
      q: "Are donations tax deductible?",
      a: "KBS is a facilitator. We provide a receipt of the transfer, but please consult your tax professional regarding deductibility of in-kind donations."
    }
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    alert("Message sent to support! We'll get back to you shortly.");
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
       {/* Header */}
       <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-4 bg-white sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full -ml-2">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Help & Support</h1>
      </div>

      <div className="p-6">
        {/* Hero */}
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">How can we help?</h2>
            <p className="text-gray-500">Find answers or contact our team.</p>
        </div>

        {/* FAQ Section */}
        <div className="mb-10">
          <h3 className="font-bold text-gray-900 mb-4 px-1">Frequently Asked Questions</h3>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="font-semibold text-gray-800 text-sm">{faq.q}</span>
                  {openFaq === index ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h3 className="font-bold text-gray-900 mb-4 px-1">Contact Us</h3>
          <form onSubmit={handleSendMessage} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
             <textarea 
                className="w-full h-32 p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary-200 outline-none text-sm resize-none mb-4"
                placeholder="Describe your issue..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
             ></textarea>
             <button 
                type="submit"
                className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
             >
                <Send size={18} />
                Send Message
             </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Support;