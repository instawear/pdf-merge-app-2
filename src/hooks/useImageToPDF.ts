import { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { toast } from 'sonner';
import { ImageFile } from './useImageFiles';

type ConvertStatus = 'idle' | 'converting' | 'done' | 'error';

export function useImageToPDF() {
  const [status, setStatus] = useState<ConvertStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const convertToPDF = useCallback(async (files: ImageFile[], pageSize: 'a4' | 'letter' | 'auto' = 'auto'): Promise<void> => {
    if (files.length === 0) {
      setError('Please add at least 1 image to convert.');
      return;
    }

    setStatus('converting');
    setProgress(0);
    setError(null);

    try {
      const pdfDoc = await PDFDocument.create();
      const total = files.length;

      for (let i = 0; i < total; i++) {
        const imageFile = files[i];
        const imageBuffer = await imageFile.file.arrayBuffer();
        
        let embeddedImage;
        const mimeType = imageFile.file.type;
        
        if (mimeType === 'image/jpeg') {
          embeddedImage = await pdfDoc.embedJpg(imageBuffer);
        } else if (mimeType === 'image/png') {
          embeddedImage = await pdfDoc.embedPng(imageBuffer);
        } else {
          toast.warning(`Skipping ${imageFile.name} - format not directly supported`);
          continue;
        }

        // Get image dimensions
        const imgWidth = embeddedImage.width;
        const imgHeight = embeddedImage.height;
        
        // Define page sizes
        let pageWidth = 595; // A4 width
        let pageHeight = 842; // A4 height
        
        if (pageSize === 'letter') {
          pageWidth = 612;
          pageHeight = 792;
        } else if (pageSize === 'auto') {
          // Maintain aspect ratio
          const aspectRatio = imgHeight / imgWidth;
          pageWidth = 595;
          pageHeight = pageWidth * aspectRatio;
        }

        // Calculate dimensions to fit image on page
        let drawWidth = pageWidth - 20;
        let drawHeight = drawWidth * (imgHeight / imgWidth);

        if (drawHeight > pageHeight - 20) {
          drawHeight = pageHeight - 20;
          drawWidth = drawHeight * (imgWidth / imgHeight);
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        const x = (pageWidth - drawWidth) / 2;
        const y = (pageHeight - drawHeight) / 2;

        page.drawImage(embeddedImage, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });

        setProgress(Math.round(((i + 1) / total) * 85));
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      setProgress(90);
      const pdfBytes = await pdfDoc.save();
      setProgress(98);

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'images-to-pdf.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      setProgress(100);
      setStatus('done');
      toast.success('PDF created and downloaded successfully!');
    } catch (err) {
      console.error('Image to PDF error:', err);
      setError('Failed to convert images to PDF. Please ensure all files are valid images.');
      setStatus('error');
      toast.error('Failed to convert images to PDF');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setError(null);
  }, []);

  return { status, progress, error, convertToPDF, reset };
}
