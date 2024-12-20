import { useState } from 'react';
import Image from 'next/image';
import { LockIcon, HeartIcon, MessageSquare } from 'lucide-react';
import { Post } from '@/types/post';
import { VideoContent } from '../posts/VideoContent';
import { VideoModal } from '../posts/VideoModal';

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
  const [isBlurred, setIsBlurred] = useState(!post.is_public);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleMediaClick = () => {
    if (post.type === 'video') {
      setIsVideoModalOpen(true);
    }
  };

  const handlePurchase = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Purchase logic here
  };

  return (
    <div className="group relative w-full overflow-hidden">
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
      
      <div className="relative backdrop-blur-sm bg-white/80 border border-white/20 rounded-2xl overflow-hidden transform transition-all duration-300 hover:shadow-xl">
        {/* Creator Info */}
        <div className="flex items-center p-4 gap-3 border-b border-gray-100">
          <div className="relative w-10 h-10">
            <Image
              src={post.creator.avatar_url || '/default_profile_picture.jpg'}
              alt={post.creator.name}
              fill
              className="rounded-full object-cover ring-2 ring-purple-500/20"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{post.creator.name}</h3>
            <p className="text-xs text-gray-500">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Description */}
        {post.description && (
          <div className="px-4 py-3">
            <p className="text-gray-700">{post.description}</p>
          </div>
        )}

        {/* Media Container */}
        <div className="relative aspect-video">
          {post.type === 'image' ? (
            <div className="relative w-full h-full group/image">
              <Image
                src={post.url}
                alt={post.description || 'Post image'}
                fill
                className={`object-cover transition-all duration-500 ${
                  isBlurred ? 'blur-xl scale-110' : 'blur-0 scale-100'
                }`}
              />
              {/* Holographic overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-500"></div>
            </div>
          ) : (
            <>
              <VideoContent url={post.url} onClick={handleMediaClick} />
              <VideoModal
                isOpen={isVideoModalOpen}
                onClose={() => setIsVideoModalOpen(false)}
                videoUrl={post.url}
              />
            </>
          )}

          {/* Premium Content Overlay */}
          {!post.is_public && (
            <div className="absolute inset-0 backdrop-blur-md bg-black/30 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="transform transition-transform group-hover:scale-110 duration-300">
                <LockIcon className="w-8 h-8 mb-2" />
                <p className="font-medium text-xl">${((post.price ?? 0) / 100).toFixed(2)}</p>
                <button
                  onClick={handlePurchase}
                  className="mt-4 px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-opacity-90 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  Purchase
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Interaction Bar */}
        <div className="p-4 flex items-center justify-between border-t border-gray-100">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className="flex items-center gap-2 text-gray-600 hover:text-pink-500 transition-colors bg-transparent p-0"
            >
              <HeartIcon 
                className={`w-5 h-5 ${isLiked ? 'fill-pink-500 text-pink-500' : ''}`} 
              />
              <span className="text-sm">{post.likes || 0}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-purple-500 transition-colors bg-transparent p-0">
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm">{post.comments || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
