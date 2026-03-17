import { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { PDFFile } from '@/types';
import { toast } from 'sonner';
import { generatePDFThumbnail } from '@/lib/pdfThumbnail';

function generateId() {
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

export function usePDFFiles() {
  const [files, setFiles] = useState<PDFFile[]>([]);

  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const pdfFiles = fileArray.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));

    if (pdfFiles.length < fileArray.length) {
      toast.error('Only PDF files are supported. Non-PDF files were skipped.');
    }

    if (pdfFiles.length === 0) return;

    // Check for duplicates
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

  const formatFileSize = useCallback((bytes: number) => formatSize(bytes), []);

  return { files, addFiles, removeFile, reorderFiles, clearFiles, formatFileSize };
}
