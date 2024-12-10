'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface CreatePostFormProps {
  onSuccess?: () => void;
}

export const CreatePostForm = ({ onSuccess }: CreatePostFormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    file: null as File | null,
    type: 'image' as 'image' | 'video',
    title: '',
    description: '',
    price: 0,
    is_public: true
  });
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
      const url = URL.createObjectURL(file);
      setPreview(url);
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      setFormData(prev => ({ ...prev, type }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;

      // Simulate upload progress since Supabase doesn't provide progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(fileName, formData.file, {
          upsert: true
        });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(fileName);

      const { error: postError } = await supabase
        .from('posts')
        .insert({
          title: formData.title,
          url: publicUrl,
          type: formData.type,
          description: formData.description,
          price: formData.price,
          is_public: formData.is_public,
          creator_id: user.id
        });

      if (postError) throw postError;

      setFormData({
        file: null,
        type: 'image',
        title: '',
        description: '',
        price: 0,
        is_public: true
      });
      setPreview(null);
      onSuccess?.();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to upload file. Please try again.');
      } else {
        setError('Failed to upload file. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {loading ? (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Uploading your content...</h3>
            <p className="text-gray-600">{uploadProgress}% complete</p>
          </div>
          
          {/* Fancy Progress Bar */}
          <div className="relative pt-1">
            <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-100">
              <div 
                style={{ width: `${uploadProgress}%` }}
                className="transition-all duration-300 shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-indigo-600"
              />
            </div>
          </div>
          
          {/* Upload Status Animation */}
          <div className="flex justify-center">
            <div className="relative w-24 h-24">
              <div 
                className="absolute inset-0 border-4 border-gray-200 rounded-full"
              />
              <div 
                className="absolute inset-0 border-4 border-blue-500 rounded-full animate-spin"
                style={{
                  borderRightColor: 'transparent',
                  borderBottomColor: 'transparent'
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-500 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {/* File Upload Section */}
          <div className="space-y-4">
            <label className="block text-lg font-medium text-gray-700">
              Upload Media
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {preview ? (
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden">
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
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-1">Drop your file here, or click to browse</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Title & Description */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-lg font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Give your post a title"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={4}
                placeholder="Tell your audience about this content"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700">
                Price (USD)
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  value={formData.price / 100}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Math.round(parseFloat(e.target.value) * 100) }))}
                  className="block w-full rounded-lg border-gray-300 pl-7 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Upload Content
          </button>
        </form>
      )}
    </div>
  );
};