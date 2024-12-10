import { useState, useEffect, useRef } from 'react';

const VideoContent = ({ url, onClick }: { url: string; onClick: () => void }) => {
  const [thumbnail, setThumbnail] = useState<string>('');
  const [error, setError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      console.log('Video element not found');
      return;
    }

    const handleLoadedData = () => {
      console.log('Video loaded data');
      try {
        video.currentTime = 1; // Ensure the video is at the 1-second mark
        video.addEventListener('seeked', generateThumbnail, { once: true });
      } catch (err) {
        console.error('Error setting video time:', err);
        setError(true);
      }
    };

    const generateThumbnail = () => {
      console.log('Generating thumbnail');
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setThumbnail(dataUrl);
        console.log('Thumbnail generated');
      } catch (err) {
        console.error('Error generating thumbnail:', err);
        setError(true);
      }
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', (e) => {
      console.error('Error loading video:', e);
      setError(true);
    });

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [url]);

  return (
    <div 
      className="relative aspect-video w-full cursor-pointer group"
      onClick={onClick}
    >
      <video 
        ref={videoRef}
        src={url}
        className="hidden"
        crossOrigin="anonymous"
        preload="metadata"
      />
      
      {thumbnail ? (
        <>
          <img
            src={thumbnail}
            alt="Video thumbnail"
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center group-hover:bg-black/75 transition-colors">
              <PlayIcon className="w-8 h-8 text-white" />
            </div>
          </div>
        </>
      ) : (
        <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
          <PlayIcon className="w-12 h-12 text-gray-400" />
        </div>
      )}
    </div>
  );
};

export default VideoContent;