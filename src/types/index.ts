export interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount?: number;
  thumbnail?: string;
}

export type MergeStatus = 'idle' | 'loading' | 'merging' | 'done' | 'error';
