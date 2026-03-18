import { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { toast } from 'sonner';
import { ImageFile } from './useImageFiles';

type ConvertStatus = 'idle' | 'converting' | 'done' | 'error';
type MarginType = 'none' | 'small' | 'big';

// Convert unsupported image formats to PNG using Canvas
async function convertImageFormat(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to convert image'));
              return;
            }
            blob.arrayBuffer().then(resolve).catch(reject);
          },
          'image/png'
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function useImageToPDF() {
  const [status, setStatus] = useState<ConvertStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const convertToPDF = useCallback(
    async (
      files: ImageFile[],
      pageSize: 'a4' | 'letter' | 'auto' = 'auto',
      marginType: MarginType = 'small'
    ): Promise<void> => {
      if (files.length === 0) {
        setError('Please add at least 1 image to convert.');
        return;
      }

      setStatus('converting');
      setProgress(0);
      setError(null);

      try {
        const pdfDoc = await PDFDocument.create();

        // A4: 595x842, Letter: 612x792
        let baseWidth = 595;
        let baseHeight = 842;

        if (pageSize === 'letter') {
          baseWidth = 612;
          baseHeight = 792;
        }

        // Define margin sizes in points
        const marginSizes: Record<MarginType, number> = {
          none: 0,
          small: 20,
          big: 40,
        };

        const margin = marginSizes[marginType];
        const total = files.length;

        for (let i = 0; i < total; i++) {
          const imageFile = files[i];
          let imageBuffer = await imageFile.file.arrayBuffer();
          const mimeType = imageFile.file.type;

          let embeddedImage;

          // Handle native formats
          if (mimeType === 'image/jpeg') {
            embeddedImage = await pdfDoc.embedJpg(imageBuffer);
          } else if (mimeType === 'image/png') {
            embeddedImage = await pdfDoc.embedPng(imageBuffer);
          } else {
            // Convert other formats to PNG via canvas
            try {
              const convertedBuffer = await convertImageFormat(imageFile.file);
              embeddedImage = await pdfDoc.embedPng(convertedBuffer);
            } catch (err) {
              toast.warning(`Skipping ${imageFile.name} - failed to process format`);
              continue;
            }
          }

          // Get image dimensions
          const imgWidth = embeddedImage.width;
          const imgHeight = embeddedImage.height;

          // Calculate page size (auto fits to image, fixed for a4/letter)
          let pageWidth = baseWidth;
          let pageHeight = baseHeight;

          if (pageSize === 'auto') {
            // Maintain aspect ratio for auto
            const aspectRatio = imgHeight / imgWidth;
            pageWidth = baseWidth;
            pageHeight = pageWidth * aspectRatio + margin * 2;
          }

          // Calculate dimensions to fit image on page
          const availableWidth = pageWidth - margin * 2;
          const availableHeight = pageHeight - margin * 2;

          let drawWidth = availableWidth;
          let drawHeight = drawWidth * (imgHeight / imgWidth);

          if (drawHeight > availableHeight) {
            drawHeight = availableHeight;
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
    },
    []
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setError(null);
  }, []);

  return { status, progress, error, convertToPDF, reset };
}
