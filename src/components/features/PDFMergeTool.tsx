import { useState } from 'react';
import { Plus, Trash2, Info, ArrowUpDown } from 'lucide-react';
import FileDropZone from './FileDropZone';
import FileList from './FileList';
import MergeProgress from './MergeProgress';
import { usePDFFiles } from '@/hooks/usePDFFiles';
import { usePDFMerge } from '@/hooks/usePDFMerge';

export default function PDFMergeTool() {
  const { files, addFiles, removeFile, reorderFiles, clearFiles, formatFileSize } = usePDFFiles();
  const { status, progress, error, mergePDFs, reset } = usePDFMerge();
  const [showDropZone, setShowDropZone] = useState(true);

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
                  <Plus className="w-3.5 h-3.5" />
                  Add More
                </button>
                <button
                  onClick={clearFiles}
                  disabled={isBusy}
                  aria-label="Clear all files"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-destructive border border-destructive/20 hover:bg-destructive/10 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All
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
          </div>
        )}

        {/* Merge Actions */}
        <div className="px-6 pb-6 pt-2">
          <MergeProgress
            status={status}
            progress={progress}
            error={error}
            fileCount={files.length}
            onMerge={handleMerge}
            onReset={handleReset}
            disabled={!canMerge}
          />

          {/* Security note */}
          <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-muted/50">
            <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">100% secure & private:</strong> All PDF processing happens directly in your browser. Your files are never uploaded to any server.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
