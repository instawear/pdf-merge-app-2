import { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { PDFFile, MergeStatus } from '@/types';

export function usePDFMerge() {
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
        // Small delay to allow UI to update
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      setProgress(90);
      const mergedBytes = await mergedPdf.save();
      setProgress(98);

      // Trigger download
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
