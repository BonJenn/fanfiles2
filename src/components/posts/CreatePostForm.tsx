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
      const filePath = `posts/${fileName}`;

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${filePath}`, true);
      xhr.setRequestHeader('Authorization', `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentCompleted = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(percentCompleted);
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200) {
          const storageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/posts`;
          const fileUrl = `${storageUrl}/${filePath}`;

          const { error: postError } = await supabase
            .from('posts')
            .insert({
              title: formData.title,
              url: fileUrl,
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
        } else {
          setError('Failed to upload file. Please try again.');
        }
        setLoading(false);
      };

      xhr.onerror = () => {
        setError('Failed to upload file. Please try again.');
        setLoading(false);
      };

      const uploadData = new FormData();
      uploadData.append('file', formData.file);
      xhr.send(uploadData);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to upload file. Please try again.');
      } else {
        setError('Failed to upload file. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-500 rounded-md">
          {error}
        </div>
      )}

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Media
        </label>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="w-full"
        />
        {preview && (
          <div className="mt-2 relative aspect-video w-full">
            {formData.type === 'image' ? (
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover rounded-md"
              />
            ) : (
              <video
                src={preview}
                controls
                className="w-full rounded-md"
              />
            )}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {loading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full"
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price (in cents)
        </label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
          className="w-full"
        />
      </div>

      {/* Public Checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.is_public}
          onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
          className="mr-2"
        />
        <label className="text-sm font-medium text-gray-700">
          Public
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Uploading...' : 'Submit'}
      </button>
    </form>
  );
};