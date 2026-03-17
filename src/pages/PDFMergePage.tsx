import { useState, useCallback, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Upload, X, ChevronUp, ChevronDown, Download, Loader2,
  CheckCircle2, AlertCircle, FileText, Info, ArrowUpDown,
  Plus, Trash2, GripVertical, FilePlus
} from 'lucide-react';
import { generatePDFThumbnail } from '@/lib/pdfThumbnail';

// ─── Types ─────────────────────────────────────────────────────────────────
interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  thumbnail?: string;
}

type MergeStatus = 'idle' | 'merging' | 'done' | 'error';

// ─── Utility Functions ─────────────────────────────────────────────────────
function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function getPageCount(file: File): Promise<number> {
  try {
    const buffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
    return pdf.getPageCount();
  } catch {
    return 0;
  }
}

// ─── Hook: usePDFFiles ─────────────────────────────────────────────────────
function usePDFFiles() {
  const [files, setFiles] = useState<PDFFile[]>([]);

  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const pdfFiles = fileArray.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));

    if (pdfFiles.length < fileArray.length) {
      toast.error('Only PDF files are supported. Non-PDF files were skipped.');
    }

    if (pdfFiles.length === 0) return;

    const uniqueFiles = pdfFiles.filter(f =>
      !files.some(existing => existing.name === f.name && existing.size === f.size)
    );

    if (uniqueFiles.length < pdfFiles.length) {
      toast.warning('Duplicate files were skipped.');
    }

    const processed: PDFFile[] = await Promise.all(
      uniqueFiles.map(async file => {
        const pageCount = await getPageCount(file);
        const thumbnail = await generatePDFThumbnail(file);
        return {
          id: generateId(),
          file,
          name: file.name,
          size: file.size,
          pageCount,
          thumbnail,
        };
      })
    );

    setFiles(prev => [...prev, ...processed]);
    if (processed.length > 0) {
      toast.success(`${processed.length} file${processed.length > 1 ? 's' : ''} added successfully.`);
    }
  }, [files]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const reorderFiles = useCallback((fromIndex: number, toIndex: number) => {
    setFiles(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  return { files, addFiles, removeFile, reorderFiles, clearFiles, formatFileSize: formatSize };
}

// ─── Hook: usePDFMerge ─────────────────────────────────────────────────────
function usePDFMerge() {
  const [status, setStatus] = useState<MergeStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mergePDFs = useCallback(async (files: PDFFile[]): Promise<void> => {
    if (files.length < 2) {
      setError('Please add at least 2 PDF files to merge.');
      return;
    }

    setStatus('merging');
    setProgress(0);
    setError(null);

    try {
      const mergedPdf = await PDFDocument.create();
      const total = files.length;

      for (let i = 0; i < total; i++) {
        const arrayBuffer = await files[i].file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pageIndices = pdf.getPageIndices();
        const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
        copiedPages.forEach((page: any) => mergedPdf.addPage(page));
        setProgress(Math.round(((i + 1) / total) * 85));
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      setProgress(90);
      const mergedBytes = await mergedPdf.save();
      setProgress(98);

      const blob = new Blob([mergedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged-document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      setProgress(100);
      setStatus('done');
    } catch (err) {
      console.error('PDF merge error:', err);
      setError('Failed to merge PDFs. Please ensure all files are valid, unlocked PDFs.');
      setStatus('error');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setError(null);
  }, []);

  return { status, progress, error, mergePDFs, reset };
}

// ─── Component: FileDropZone ─────────────────────────────────────────────
interface FileDropZoneProps {
  onFilesAdded: (files: FileList | File[]) => void;
  disabled?: boolean;
  isDragging?: boolean;
  onDragStateChange?: (isDragging: boolean) => void;
}

function FileDropZone({ onFilesAdded, disabled, isDragging: externalDragging, onDragStateChange }: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragging = externalDragging ?? isDragging;

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    onDragStateChange?.(false);
    if (disabled) return;
    if (e.dataTransfer.files.length > 0) onFilesAdded(e.dataTransfer.files);
  }, [onFilesAdded, disabled, onDragStateChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
      onDragStateChange?.(true);
    }
  }, [disabled, onDragStateChange]);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
    onDragStateChange?.(false);
  }, [onDragStateChange]);

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      onFilesAdded(e.target.files);
      e.target.value = '';
    }
  }, [onFilesAdded]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      handleClick();
    }
  }, [disabled, handleClick]);

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload PDF files by clicking or dragging and dropping"
      aria-disabled={disabled}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200',
        'min-h-[220px] p-8 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        dragging
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 scale-[1.01] shadow-lg shadow-blue-500/10'
          : 'border-border hover:border-blue-400 hover:bg-muted/40',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
      )}
    >
      {dragging && <div className="absolute inset-0 rounded-2xl bg-blue-500/5 animate-pulse pointer-events-none" />}

      <div className={cn(
        'w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-200',
        dragging ? 'bg-blue-100 dark:bg-blue-900/50 scale-110' : 'bg-muted'
      )}>
        {dragging ? (
          <FilePlus className="w-8 h-8 text-blue-600" />
        ) : (
          <Upload className="w-8 h-8 text-blue-600" />
        )}
      </div>

      <p className="text-lg font-semibold text-foreground mb-1">
        {dragging ? 'Drop your PDFs here' : 'Drag & drop PDF files here'}
      </p>
      <p className="text-sm text-muted-foreground mb-4">or click to browse from your device</p>
      <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors pointer-events-none">
        <Upload className="w-4 h-4" />Upload PDFs
      </span>
      <p className="text-xs text-muted-foreground mt-3">
        Supports multiple PDF files · All processing happens in your browser
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleChange}
      />
    </div>
  );
}

// ─── Component: FileItem ─────────────────────────────────────────────────
interface FileItemProps {
  file: PDFFile;
  index: number;
  total: number;
  onRemove: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isDragging?: boolean;
  formatSize: (bytes: number) => string;
}

function FileItem({
  file, index, total, onRemove, onMoveUp, onMoveDown, isDragging, formatSize,
}: FileItemProps) {
  return (
    <div className={cn(
      'group flex items-center gap-3 p-3 sm:p-4 rounded-xl border bg-card transition-all duration-150',
      isDragging
        ? 'border-blue-400 shadow-lg shadow-blue-500/10 bg-blue-50/50 dark:bg-blue-950/30 scale-[1.02]'
        : 'border-border hover:border-blue-200 hover:shadow-sm'
    )}>
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
        {index + 1}
      </div>

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

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate" title={file.name}>
          {file.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{formatSize(file.size)}</span>
          {file.pageCount > 0 && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className="text-xs text-muted-foreground">
                {file.pageCount} {file.pageCount === 1 ? 'page' : 'pages'}
              </span>
            </>
          )}
        </div>
      </div>

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

      <div className="hidden sm:flex flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors" aria-hidden="true">
        <GripVertical className="w-5 h-5" />
      </div>

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

// ─── Component: FileList ─────────────────────────────────────────────────
interface FileListProps {
  files: PDFFile[];
  onRemove: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  formatSize: (bytes: number) => string;
}

function FileList({ files, onRemove, onReorder, formatSize }: FileListProps) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggingIndex !== null && draggingIndex !== toIndex) {
      onReorder(draggingIndex, toIndex);
    }
    setDraggingIndex(null);
    setDragOverIndex(null);
  }, [draggingIndex, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDraggingIndex(null);
    setDragOverIndex(null);
  }, []);

  const moveUp = useCallback((index: number) => {
    if (index > 0) onReorder(index, index - 1);
  }, [onReorder]);

  const moveDown = useCallback((index: number) => {
    if (index < files.length - 1) onReorder(index, index + 1);
  }, [onReorder, files.length]);

  return (
    <div className="space-y-2" role="list" aria-label="PDF files to merge">
      {files.map((file, index) => (
        <div
          key={file.id}
          role="listitem"
          draggable
          onDragStart={e => handleDragStart(e, index)}
          onDragEnter={e => handleDragEnter(e, index)}
          onDragOver={handleDragOver}
          onDrop={e => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`transition-all duration-150 ${
            dragOverIndex === index && draggingIndex !== index ? 'scale-[1.02] opacity-80' : ''
          }`}
        >
          <FileItem
            file={file}
            index={index}
            total={files.length}
            onRemove={onRemove}
            onMoveUp={moveUp}
            onMoveDown={moveDown}
            isDragging={draggingIndex === index}
            formatSize={formatSize}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Component: PDFMergePage ────────────────────────────────────────────
export default function PDFMergePage() {
  const { files, addFiles, removeFile, reorderFiles, clearFiles, formatFileSize } = usePDFFiles();
  const { status, progress, error, mergePDFs, reset } = usePDFMerge();
  const [showDropZone, setShowDropZone] = useState(true);
  const addMoreRef = useRef<HTMLInputElement>(null);

  const handleMerge = () => {
    mergePDFs(files);
  };

  const handleReset = () => {
    reset();
    clearFiles();
    setShowDropZone(true);
  };

  const hasFiles = files.length > 0;
  const canMerge = files.length >= 2 && status !== 'merging';
  const isBusy = status === 'merging';

  return (
    <section
      id="tool"
      className="relative w-full max-w-2xl mx-auto"
      aria-label="PDF Merge Tool"
    >
      <div className="bg-card border border-border rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden">
        {/* Tool Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-foreground">PDF Merge Tool</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {hasFiles
                  ? `${files.length} file${files.length > 1 ? 's' : ''} added · ${files.length >= 2 ? 'Ready to merge' : 'Add at least 2 files'}`
                  : 'Upload 2 or more PDF files to get started'}
              </p>
            </div>
            {hasFiles && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDropZone(v => !v)}
                  aria-label="Add more files"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <Plus className="w-3.5 h-3.5" />Add More
                </button>
                <button
                  onClick={clearFiles}
                  disabled={isBusy}
                  aria-label="Clear all files"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-destructive border border-destructive/20 hover:bg-destructive/10 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <Trash2 className="w-3.5 h-3.5" />Clear All
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Drop Zone */}
        {(!hasFiles || showDropZone) && (
          <div className="px-6 pb-4">
            <FileDropZone
              onFilesAdded={(f) => {
                addFiles(f);
                setShowDropZone(false);
              }}
              disabled={isBusy}
            />
          </div>
        )}

        {/* File List */}
        {hasFiles && (
          <div className="px-6 pb-4">
            {files.length > 1 && (
              <div className="flex items-center gap-2 mb-3 py-2 px-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                <ArrowUpDown className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Drag files or use the arrows to reorder before merging
                </p>
              </div>
            )}
            <FileList
              files={files}
              onRemove={removeFile}
              onReorder={reorderFiles}
              formatSize={formatFileSize}
            />

            {/* Add More button */}
            {status !== 'merging' && status !== 'done' && (
              <div className="mt-4">
                <button
                  onClick={() => addMoreRef.current?.click()}
                  className={cn(
                    'w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-bold text-base transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/30 border-2 border-dashed',
                    'border-blue-400 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/40 hover:border-blue-500 hover:scale-[1.01] active:scale-[0.99]'
                  )}
                >
                  <Plus className="w-5 h-5" />Add More PDF Files
                </button>
                <input
                  ref={addMoreRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  className="sr-only"
                  aria-hidden="true"
                  tabIndex={-1}
                  onChange={e => {
                    if (e.target.files?.length) {
                      addFiles(e.target.files);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Merge Actions */}
        <div className="px-6 pb-6 pt-4 space-y-4">
          {/* Progress bar */}
          {status === 'merging' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  Merging {files.length} PDFs...
                </span>
                <span className="font-bold text-blue-600">{progress}%</span>
              </div>
              <div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}
                className="w-full h-3 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Success */}
          {status === 'done' && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-green-800 dark:text-green-400">PDF merged successfully!</p>
                <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">Your download should start automatically.</p>
              </div>
              <button onClick={handleReset} className="text-xs font-semibold text-green-700 dark:text-green-400 hover:underline focus:outline-none">
                Merge another
              </button>
            </div>
          )}

          {/* Error */}
          {status === 'error' && error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-800 dark:text-red-400">Merge failed</p>
                <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Merge button */}
          {status !== 'done' ? (
            <button
              onClick={handleMerge}
              disabled={!canMerge}
              aria-label={`Merge ${files.length} PDF files`}
              className={cn(
                'w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/30',
                !canMerge
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:scale-[1.01] active:scale-[0.99]'
              )}
            >
              {status === 'merging' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />Merging PDFs...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />{files.length >= 2 ? `Merge ${files.length} PDFs & Download` : 'Merge PDF'}
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/30"
            >
              <Download className="w-5 h-5" />Start New Merge
            </button>
          )}

          {/* Security note */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/50">
            <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">100% secure & private:</strong> All PDF processing happens in your browser. Your files are never uploaded to any server.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
