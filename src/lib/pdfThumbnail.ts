import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Set the worker URL
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function generatePDFThumbnail(file: File, maxWidth: number = 120, maxHeight: number = 160): Promise<string | undefined> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

    // Get the first page
    const page = await pdf.getPage(1);

    // Calculate scale to fit within max dimensions while maintaining aspect ratio
    const viewport = page.getViewport({ scale: 1 });
    const scale = Math.min(maxWidth / viewport.width, maxHeight / viewport.height);
    const scaledViewport = page.getViewport({ scale });

    // Create canvas for rendering
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Failed to get canvas context');
    }

    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    // Render page to canvas
    await page.render({
      canvasContext: context,
      viewport: scaledViewport,
      canvas,
    }).promise;

    // Convert canvas to data URL
    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (error) {
    console.error('Failed to generate PDF thumbnail:', error);
    return undefined;
  }
}
