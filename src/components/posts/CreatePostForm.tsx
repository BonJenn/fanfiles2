'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { Upload, X, Image as ImageIcon, Film, Lock, Globe } from 'lucide-react';

interface CreatePostFormProps {
  onSuccess?: () => void;
}

export const CreatePostForm = ({ onSuccess }: CreatePostFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    is_public: true,
    price: '',
    type: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFile(file);
    setFormData(prev => ({
      ...prev,
      type: file.type.startsWith('image/') ? 'image' : 'video'
    }));

    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    // ... rest of submit logic
  };

  return (
    <div className="relative">
      {/* Y2K-inspired decorative elements */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-blue-300 via-purple-300 to-pink-400 rounded-full blur-3xl opacity-30"></div>

      <form onSubmit={handleSubmit} className="relative space-y-6">
        {error && (
          <div className="p-4 bg-red-50/80 backdrop-blur-sm text-red-500 rounded-xl border border-red-100 animate-shake">
            {error}
          </div>
        )}

        {/* File Upload Section */}
        <div className="space-y-4">
          <label className="block text-lg font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Upload Media
          </label>
          <div 
            className={`relative group border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
              ${preview ? 'border-purple-300' : 'border-gray-300 hover:border-purple-400'}`}
          >
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label 
              htmlFor="file-upload" 
              className="cursor-pointer block"
            >
              {preview ? (
                <div className="relative aspect-video w-full rounded-lg overflow-hidden group-hover:ring-4 ring-purple-200 transition-all duration-300">
                  {formData.type === 'image' ? (
                    <Image
                      src={preview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <video
                      src={preview}
                      controls
                      className="w-full rounded-lg"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white">Change media</p>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-purple-50 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-700">Drop your file here, or click to browse</p>
                    <p className="text-sm text-gray-500 mt-1">Support images and videos</p>
                  </div>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
            rows={4}
            placeholder="Write something about your post..."
          />
        </div>

        {/* Visibility and Price Controls */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, is_public: true, price: '' }))}
            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300
              ${formData.is_public 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                : 'bg-white text-gray-700 border border-gray-200'}`}
          >
            <Globe className="w-5 h-5" />
            Public
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, is_public: false }))}
            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300
              ${!formData.is_public 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                : 'bg-white text-gray-700 border border-gray-200'}`}
          >
            <Lock className="w-5 h-5" />
            Premium
          </button>
        </div>

        {/* Price Input (for premium content) */}
        {!formData.is_public && (
          <div className="animate-slideDown">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (USD)
            </label>
            <input
              type="number"
              min="0.99"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              placeholder="Enter price..."
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !file}
          className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium 
            disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
        >
          {isLoading ? 'Creating Post...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
};