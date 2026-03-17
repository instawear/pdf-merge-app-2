import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface ImageFile {
  id: string;
  file: File;
  name: string;
  size: number;
  preview: string;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function useImageFiles() {
  const [files, setFiles] = useState<ImageFile[]>([]);

  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const imageFiles = fileArray.filter(f => {
      const isImage = f.type.startsWith('image/');
      const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff'];
      return isImage && supportedTypes.includes(f.type);
    });

    if (imageFiles.length < fileArray.length) {
      toast.error('Only image files (JPG, PNG, GIF, WebP, BMP, TIFF) are supported.');
    }

    if (imageFiles.length === 0) return;

    // Check for duplicates
    const uniqueFiles = imageFiles.filter(f =>
      !files.some(existing => existing.name === f.name && existing.size === f.size)
    );

    if (uniqueFiles.length < imageFiles.length) {
      toast.warning('Duplicate files were skipped.');
    }

    const processed: ImageFile[] = await Promise.all(
      uniqueFiles.map(async file => {
        return new Promise<ImageFile>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              id: generateId(),
              file,
              name: file.name,
              size: file.size,
              preview: e.target?.result as string,
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );

    setFiles(prev => [...prev, ...processed]);
    if (processed.length > 0) {
      toast.success(`${processed.length} image${processed.length > 1 ? 's' : ''} added successfully.`);
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

  const formatFileSize = useCallback((bytes: number) => formatSize(bytes), []);

  return { files, addFiles, removeFile, reorderFiles, clearFiles, formatFileSize };
}
