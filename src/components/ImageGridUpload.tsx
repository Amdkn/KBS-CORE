import React, { useRef, useState } from 'react';
import { Plus, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface ImageGridUploadProps {
  images: string[];
  onImagesChange: (newImages: string[]) => void;
}

const ImageGridUpload: React.FC<ImageGridUploadProps> = ({ images, onImagesChange }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);

    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('listings')
        .upload(filePath, file);

      if (uploadError) {
        // Fallback for demo environment if bucket doesn't exist
        console.warn("Upload failed (likely missing bucket), using local preview.", uploadError);
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            onImagesChange([...images, e.target.result as string]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        // 2. Get Public URL
        const { data } = supabase.storage.from('listings').getPublicUrl(filePath);
        onImagesChange([...images, data.publicUrl]);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    onImagesChange(images.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Upload Button (Always first) */}
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 hover:border-primary-400 hover:text-primary-500 transition-all"
      >
        {uploading ? (
          <Loader2 className="animate-spin" size={24} />
        ) : (
          <Plus size={28} />
        )}
        <span className="text-xs font-bold mt-1">Add Photo</span>
      </button>

      {/* Hidden Input */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleUpload}
      />

      {/* Image List */}
      {images.map((url, index) => (
        <div key={index} className="aspect-square relative group rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm">
          <img src={url} alt={`Listing ${index + 1}`} className="w-full h-full object-cover" />
          <button 
            onClick={() => removeImage(index)}
            className="absolute top-1.5 right-1.5 p-1 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors backdrop-blur-sm"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      {/* Empty Placeholders (Fill up to 3 slots for visual balance if needed, optional) */}
      {images.length === 0 && (
         <>
          <div className="aspect-square bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center opacity-50">
             <ImageIcon className="text-gray-300" size={24}/>
          </div>
          <div className="aspect-square bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center opacity-50">
             <ImageIcon className="text-gray-300" size={24}/>
          </div>
         </>
      )}
    </div>
  );
};

export default ImageGridUpload;