'use client';

interface VideoContentProps {
  url: string;
  onClick?: () => void;
}

export default function VideoContent({ url, onClick }: VideoContentProps) {
  return (
    <div 
      onClick={onClick}
      className="relative w-full h-full cursor-pointer group"
    >
      <video
        src={url}
        className="w-full h-full object-cover"
        preload="metadata"
      />
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
          <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1" />
        </div>
      </div>
    </div>
  );
}