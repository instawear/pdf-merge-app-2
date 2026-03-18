import { useState } from 'react';
import { Plus, Trash2, Info, Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import ImageDropZone from './ImageDropZone';
import ImageList from './ImageList';
import { useImageFiles } from '@/hooks/useImageFiles';
import { useImageToPDF } from '@/hooks/useImageToPDF';
import { ImageFile } from '@/hooks/useImageFiles';

// Page Preview Component
const PagePreview = ({ 
  image, 
  pageSize, 
  margin 
}: { 
  image: ImageFile;
  pageSize: 'a4' | 'letter' | 'auto';
  margin: 'none' | 'small' | 'big';
}) => {
  // Page dimensions in points (1/72 inch)
  const pageDimensions: Record<'a4' | 'letter', { width: number; height: number }> = {
    a4: { width: 595, height: 842 },
    letter: { width: 612, height: 792 },
  };

  // Margin sizes in points
  const marginSizes: Record<'none' | 'small' | 'big', number> = {
    none: 0,
    small: 20,
    big: 40,
  };

  const margin_pt = marginSizes[margin];

  // Get image dimensions from preview
  const img = new window.Image();
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number } | null>(null);

  if (image && !imgDimensions) {
    img.onload = () => {
      setImgDimensions({ width: img.width, height: img.height });
    };
    img.src = image.preview;
  }

  // Calculate page size
  let pageWidth = pageDimensions.a4.width;
  let pageHeight = pageDimensions.a4.height;

  if (pageSize === 'letter') {
    pageWidth = pageDimensions.letter.width;
    pageHeight = pageDimensions.letter.height;
  }

  // Scale factor for preview (fit to container)
  const previewMaxWidth = 160;
  const scaleFactor = previewMaxWidth / pageWidth;
  const scaledPageWidth = pageWidth * scaleFactor;
  const scaledPageHeight = pageHeight * scaleFactor;
  const scaledMargin = margin_pt * scaleFactor;

  // Calculate image dimensions on page
  const availableWidth = scaledPageWidth - scaledMargin * 2;
  const availableHeight = scaledPageHeight - scaledMargin * 2;

  let imgWidth = availableWidth;
  let imgHeight = availableWidth;

  if (imgDimensions) {
    const aspectRatio = imgDimensions.height / imgDimensions.width;
    imgHeight = imgWidth * aspectRatio;

    if (imgHeight > availableHeight) {
      imgHeight = availableHeight;
      imgWidth = imgHeight / aspectRatio;
    }
  }

  const imgX = scaledMargin + (availableWidth - imgWidth) / 2;
  const imgY = scaledMargin + (availableHeight - imgHeight) / 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        style={{
          width: `${scaledPageWidth}px`,
          height: `${scaledPageHeight}px`,
          backgroundColor: '#ffffff',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        {/* Margin Area */}
        {scaledMargin > 0 && (
          <div
            style={{
              position: 'absolute',
              inset: `${scaledMargin}px`,
              border: '1px dashed #9ca3af',
              borderRadius: '2px',
            }}
          />
        )}

        {/* Image */}
        {image && (
          <img
            src={image.preview}
            alt="Preview"
            style={{
              position: 'absolute',
              left: `${imgX}px`,
              top: `${imgY}px`,
              width: `${imgWidth}px`,
              height: `${imgHeight}px`,
              objectFit: 'cover',
              borderRadius: '2px',
            }}
          />
        )}
      </div>

      {/* Info Text */}
      <div className="text-xs text-muted-foreground text-center">
        <p>
          {pageSize === 'auto' ? 'Auto' : pageSize.toUpperCase()} •{' '}
          {margin === 'none' ? 'No margin' : margin === 'small' ? 'Small' : 'Big'} margin
        </p>
      </div>
    </div>
  );
};

export default function ImageToPDFTool() {
  const { files: images, addFiles, removeFile, reorderFiles, clearFiles, formatFileSize } = useImageFiles();
  const { status, progress, error, convertToPDF, reset } = useImageToPDF();
  const [showDropZone, setShowDropZone] = useState(true);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'auto'>('auto');
  const [margin, setMargin] = useState<'none' | 'small' | 'big'>('small');

  const handleConvert = () => {
    convertToPDF(images, pageSize, margin);
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

          {/* Page Size Selector & Margin Selector */}
          {hasImages && (
            <div className="space-y-3">
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
              
              <div className="p-4 rounded-lg border border-border bg-muted/50">
                <label className="text-sm font-medium text-foreground mb-2 block">Margin:</label>
                <div className="flex gap-2">
                  {[
                    { value: 'none', label: 'No margin' },
                    { value: 'small', label: 'Small' },
                    { value: 'big', label: 'Big' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setMargin(value as 'none' | 'small' | 'big')}
                      disabled={isBusy}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        margin === value
                          ? 'bg-blue-600 text-white'
                          : 'border border-border bg-background hover:bg-muted disabled:opacity-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Page Preview */}
          {hasImages && images.length > 0 && (
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground mb-3">Preview:</p>
              <div className="flex justify-center">
                <PagePreview 
                  image={images[0]}
                  pageSize={pageSize}
                  margin={margin}
                />
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
