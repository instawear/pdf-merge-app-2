import { GripVertical, X, ChevronUp, ChevronDown } from 'lucide-react';
import { ImageFile } from '@/hooks/useImageFiles';
import { cn } from '@/lib/utils';

interface ImageItemProps {
  image: ImageFile;
  index: number;
  total: number;
  onRemove: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isDragging?: boolean;
  formatSize: (bytes: number) => string;
}

export default function ImageItem({
  image,
  index,
  total,
  onRemove,
  onMoveUp,
  onMoveDown,
  isDragging,
  formatSize,
}: ImageItemProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-4 p-4 sm:p-5 rounded-xl border bg-card transition-all duration-150',
        isDragging
          ? 'border-blue-400 shadow-lg shadow-blue-500/10 bg-blue-50/50 dark:bg-blue-950/30 scale-[1.02]'
          : 'border-border hover:border-blue-200 hover:shadow-sm'
      )}
    >
      {/* Order badge */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
        {index + 1}
      </div>

      {/* Image Thumbnail */}
      <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-900 border border-border overflow-hidden flex items-center justify-center">
        <img
          src={image.preview}
          alt={`Preview of ${image.name}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate" title={image.name}>
          {image.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{formatSize(image.size)}</span>
        </div>
      </div>

      {/* Reorder buttons (mobile-friendly) */}
      <div className="flex flex-col gap-0.5 flex-shrink-0">
        <button
          onClick={() => onMoveUp(index)}
          disabled={index === 0}
          aria-label={`Move ${image.name} up`}
          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onMoveDown(index)}
          disabled={index === total - 1}
          aria-label={`Move ${image.name} down`}
          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Drag handle (desktop) */}
      <div className="hidden sm:flex flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors" aria-hidden="true">
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Remove button */}
      <button
        onClick={() => onRemove(image.id)}
        aria-label={`Remove ${image.name}`}
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
