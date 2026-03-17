import { useState } from 'react';
import { Plus, Trash2, Info, Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import ImageDropZone from './ImageDropZone';
import ImageList from './ImageList';
import { useImageFiles } from '@/hooks/useImageFiles';
import { useImageToPDF } from '@/hooks/useImageToPDF';

export default function ImageToPDFTool() {
  const { images, addFiles, removeFile, reorderFiles, clearFiles, formatFileSize } = useImageFiles();
  const { status, progress, error, convertToPDF, reset } = useImageToPDF();
  const [showDropZone, setShowDropZone] = useState(true);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'auto'>('auto');

  const handleConvert = () => {
    convertToPDF(images, pageSize);
  };

  const handleReset = () => {
    reset();
    clearFiles();
    setShowDropZone(true);
  };

  const hasImages = images.length > 0;
  const canConvert = images.length >= 1 && status !== 'converting';
  const isBusy = status === 'converting';

  return (
    <section
      id="tool"
      className="relative w-full max-w-2xl mx-auto"
      aria-label="Image to PDF Converter Tool"
    >
      <div className="bg-card border border-border rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden">
        {/* Tool Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-foreground">Image to PDF Converter</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {hasImages
                  ? `${images.length} image${images.length > 1 ? 's' : ''} added · ${canConvert ? 'Ready to convert' : 'Add images'}`
                  : 'Upload 1 or more images to get started'}
              </p>
            </div>
            {hasImages && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDropZone(v => !v)}
                  aria-label="Add more images"
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button
                  onClick={handleReset}
                  aria-label="Clear all images"
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tool Body */}
        <div className="p-6 space-y-4">
          {/* Drop Zone */}
          {showDropZone && <ImageDropZone onFilesAdded={addFiles} disabled={isBusy} />}

          {/* Images List */}
          {hasImages && <ImageList images={images} onRemove={removeFile} onReorder={reorderFiles} formatSize={formatFileSize} />}

          {/* Page Size Selector */}
          {hasImages && (
            <div className="p-4 rounded-lg border border-border bg-muted/50">
              <label className="text-sm font-medium text-foreground mb-2 block">Page Size:</label>
              <div className="flex gap-2">
                {['auto', 'a4', 'letter'].map(size => (
                  <button
                    key={size}
                    onClick={() => setPageSize(size as 'a4' | 'letter' | 'auto')}
                    disabled={isBusy}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pageSize === size
                        ? 'bg-blue-600 text-white'
                        : 'border border-border bg-background hover:bg-muted disabled:opacity-50'
                    }`}
                  >
                    {size === 'auto' ? 'Auto' : size.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-destructive">Conversion Error</p>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
            </div>
          )}

          {/* Progress State */}
          {status === 'converting' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Converting images to PDF...</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{progress}%</p>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Success State */}
          {status === 'done' && (
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/30 flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">PDF Created Successfully!</p>
                <p className="text-sm text-green-600/80 dark:text-green-400/70 mt-0.5">Your PDF has been downloaded. You can convert more images.</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {hasImages && (
            <div className="flex gap-3">
              <button
                onClick={handleConvert}
                disabled={!canConvert}
                className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isBusy ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Convert & Download PDF
                  </>
                )}
              </button>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 rounded-lg border border-blue-200/50 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/20 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-400">100% Browser-Based</p>
              <p className="text-xs text-blue-800/80 dark:text-blue-400/70 mt-0.5">All conversions happen in your browser. Your images never leave your device.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
