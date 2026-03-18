import { useRef, useState, useCallback } from 'react';
import { Upload, FilePlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageDropZoneProps {
  onFilesAdded: (files: FileList | File[]) => void;
  disabled?: boolean;
}

export default function ImageDropZone({ onFilesAdded, disabled }: ImageDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const files = e.dataTransfer.files;
    if (files.length > 0) onFilesAdded(files);
  }, [onFilesAdded, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesAdded(files);
      e.target.value = '';
    }
  }, [onFilesAdded]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload image files by clicking or dragging and dropping"
      aria-disabled={disabled}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200',
        'min-h-[220px] p-8 text-center',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        isDragging
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 scale-[1.01] shadow-lg shadow-blue-500/10'
          : 'border-border hover:border-blue-400 hover:bg-muted/40',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
      )}
    >
      {isDragging && (
        <div className="absolute inset-0 rounded-2xl bg-blue-500/5 animate-pulse pointer-events-none" />
      )}

      <div className={cn(
        'w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-200',
        isDragging ? 'bg-blue-100 dark:bg-blue-900/50 scale-110' : 'bg-muted'
      )}>
        {isDragging ? (
          <FilePlus className="w-8 h-8 text-blue-600" />
        ) : (
          <Upload className="w-8 h-8 text-blue-600" />
        )}
      </div>

      <p className="text-lg font-semibold text-foreground mb-1">
        {isDragging ? 'Drop your images here' : 'Drag & drop images here'}
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        or click to browse from your device
      </p>
      <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors pointer-events-none">
        <Upload className="w-4 h-4" />
        Upload Images
      </span>
      <p className="text-xs text-muted-foreground mt-3">
        Supports JPG, PNG, GIF, WebP, BMP, TIFF, HEIC · All processing happens in your browser
      </p>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
