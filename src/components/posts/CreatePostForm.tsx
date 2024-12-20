'use client';

import { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ImageIcon, VideoIcon } from 'lucide-react';

interface CreatePostFormProps {
  onSuccess?: () => void;
}

export function CreatePostForm({ onSuccess }: CreatePostFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file) return;

    try {
      setLoading(true);
      setError('');

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = `post-uploads/${fileName}`;
      
      // Upload to the uploads bucket
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL from uploads bucket
      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      // Transform the URL for production if needed
      const publicUrl = urlData.publicUrl.replace(
        'localhost:54321',
        `${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co`
      );

      console.log('File uploaded, public URL:', publicUrl);

      // Create post record
      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          title,
          description,
          url: publicUrl,
          creator_id: user.id,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          is_public: isPublic,
          price: price * 100,
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      // Reset form
      setTitle('');
      setDescription('');
      setFile(null);
      setPrice(0);
      setIsPublic(true);
      setPreview('');
      
      onSuccess?.();
    } catch (err: any) {
      console.error('Error creating post:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Create preview URL
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Media</label>
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*,video/*"
          className="mt-1 block w-full"
          required
        />
      </div>

      {preview && file && (
        <div className="relative aspect-video w-full">
          {file.type.startsWith('image/') ? (
            <div className="relative w-full h-[300px]">
              <Image
                src={preview}
                alt="Content preview"
                fill
                sizes="(max-width: 768px) 100vw, 700px"
                priority
                className="object-cover rounded-lg"
              />
            </div>
          ) : (
            <video
              src={preview}
              className="w-full h-full object-cover rounded-lg"
              controls
            />
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Price (USD)</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          min="0"
          step="0.01"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700">
          Make this post public
        </label>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
}