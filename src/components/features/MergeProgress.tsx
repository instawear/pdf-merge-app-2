import { CheckCircle2, Download, Loader2, AlertCircle } from 'lucide-react';
import { MergeStatus } from '@/types';
import { cn } from '@/lib/utils';

interface MergeProgressProps {
  status: MergeStatus;
  progress: number;
  error: string | null;
  fileCount: number;
  onMerge: () => void;
  onReset: () => void;
  disabled: boolean;
}

export default function MergeProgress({
  status,
  progress,
  error,
  fileCount,
  onMerge,
  onReset,
  disabled,
}: MergeProgressProps) {
  return (
    <div className="space-y-4">
      {/* Progress bar */}
      {(status === 'merging') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              Merging {fileCount} PDF files...
            </span>
            <span className="font-semibold text-blue-600">{progress}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Merge progress"
            className="w-full h-2.5 rounded-full bg-muted overflow-hidden"
          >
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Success state */}
      {status === 'done' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-800 dark:text-green-400">PDF merged successfully!</p>
            <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">Your download should start automatically.</p>
          </div>
          <button
            onClick={onReset}
            className="text-xs font-medium text-green-700 dark:text-green-400 hover:underline focus:outline-none focus:underline"
          >
            Merge another
          </button>
        </div>
      )}

      {/* Error state */}
      {status === 'error' && error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800 dark:text-red-400">Merge failed</p>
            <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Merge CTA button */}
      {status !== 'done' && (
        <button
          onClick={onMerge}
          disabled={disabled || status === 'merging'}
          aria-label={`Merge ${fileCount} PDF files into one`}
          className={cn(
            'w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-lg transition-all duration-200',
            'focus:outline-none focus:ring-4 focus:ring-blue-500/30',
            disabled || status === 'merging'
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.01] active:scale-[0.99]'
          )}
        >
          {status === 'merging' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Merging PDFs...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              {fileCount >= 2 ? `Merge ${fileCount} PDFs & Download` : 'Merge PDF'}
            </>
          )}
        </button>
      )}

      {status === 'done' && (
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/30"
        >
          <Download className="w-5 h-5" />
          Start New Merge
        </button>
      )}
    </div>
  );
}
