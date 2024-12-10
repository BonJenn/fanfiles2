import { Dialog, DialogContent } from '@/components/ui/Dialog';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

export function VideoModal({ isOpen, onClose, videoUrl }: VideoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-4xl p-0 overflow-hidden rounded-lg">
        <div className="sr-only">Video Player</div>
        <video
          className="w-full aspect-video"
          controls
          autoPlay
          src={videoUrl}
        />
      </DialogContent>
    </Dialog>
  );
}