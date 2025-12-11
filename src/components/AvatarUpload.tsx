import React, { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface AvatarUploadProps {
  url: string | null;
  onUpload: (url: string) => void;
  size?: number;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ url, onUpload, size = 150 }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        // Fallback for demo if storage isn't set up
        console.warn("Storage upload failed (bucket might not exist), using local preview.", uploadError);
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) onUpload(e.target.result as string);
        };
        reader.readAsDataURL(file);
        return;
      }

      // Get Public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      onUpload(data.publicUrl);

    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error uploading avatar!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group cursor-pointer inline-block" onClick={() => fileInputRef.current?.click()}>
      {/* Avatar Image */}
      <div 
        className="rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 relative"
        style={{ width: size, height: size }}
      >
        {url ? (
          <img
            src={url}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-400">
             <Camera size={size * 0.4} />
          </div>
        )}
        
        {/* Loading Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Loader2 className="animate-spin text-white" size={32} />
          </div>
        )}
      </div>

      {/* Edit Icon Badge */}
      <div className="absolute bottom-1 right-1 bg-primary-500 text-white p-2 rounded-full shadow-md border-2 border-white group-hover:scale-110 transition-transform">
        <Camera size={20} />
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={uploadAvatar}
        disabled={uploading}
      />
    </div>
  );
};

export default AvatarUpload;