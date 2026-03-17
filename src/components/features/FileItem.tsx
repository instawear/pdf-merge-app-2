import { GripVertical, X, FileText, ChevronUp, ChevronDown } from 'lucide-react';
import { PDFFile } from '@/types';
import { cn } from '@/lib/utils';

interface FileItemProps {
  file: PDFFile;
  index: number;
  total: number;
  onRemove: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  dragHandleProps?: Record<string, unknown>;
  isDragging?: boolean;
  formatSize: (bytes: number) => string;
}

export default function FileItem({
  file,
  index,
  total,
  onRemove,
  onMoveUp,
  onMoveDown,
  isDragging,
  formatSize,
}: FileItemProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-3 p-3 sm:p-4 rounded-xl border bg-card transition-all duration-150',
        isDragging
          ? 'border-blue-400 shadow-lg shadow-blue-500/10 bg-blue-50/50 dark:bg-blue-950/30 scale-[1.02]'
          : 'border-border hover:border-blue-200 hover:shadow-sm'
      )}
    >
      {/* Order badge */}
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
        {index + 1}
      </div>

      {/* PDF Thumbnail or Icon */}
      <div className="flex-shrink-0 w-10 h-12 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 flex flex-col items-center justify-center gap-0.5 overflow-hidden">
        {file.thumbnail ? (
          <img
            src={file.thumbnail}
            alt={`Thumbnail of ${file.name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <FileText className="w-5 h-5 text-red-500" />
            <span className="text-[9px] font-bold text-red-500 uppercase tracking-wide">PDF</span>
          </>
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate" title={file.name}>
          {file.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{formatSize(file.size)}</span>
          {file.pageCount !== undefined && file.pageCount > 0 && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className="text-xs text-muted-foreground">
                {file.pageCount} {file.pageCount === 1 ? 'page' : 'pages'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Reorder buttons (mobile-friendly) */}
      <div className="flex flex-col gap-0.5 flex-shrink-0">
        <button
          onClick={() => onMoveUp(index)}
          disabled={index === 0}
          aria-label={`Move ${file.name} up`}
          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onMoveDown(index)}
          disabled={index === total - 1}
          aria-label={`Move ${file.name} down`}
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
        onClick={() => onRemove(file.id)}
        aria-label={`Remove ${file.name}`}
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
