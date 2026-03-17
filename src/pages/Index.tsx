import { useState, useCallback, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import heroBg from '@/assets/hero-bg.jpg';
import {
  Upload, X, ChevronUp, ChevronDown, Download, Loader2,
  CheckCircle2, AlertCircle, Moon, Sun, FileText, Scissors,
  Archive, FileType2, Shield, Star, Zap, GripVertical,
  Plus, Trash2, Info, ArrowUpDown, ChevronDown as ChevronDownIcon
} from 'lucide-react';

// ─── PDF.js worker setup ───────────────────────────────────────────────────
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// ─── Types ─────────────────────────────────────────────────────────────────
interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  thumbnail: string | null;
}
type MergeStatus = 'idle' | 'merging' | 'done' | 'error';

// ─── Helpers ───────────────────────────────────────────────────────────────
function genId() { return Math.random().toString(36).slice(2, 10); }

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function processPDF(file: File): Promise<PDFFile> {
  const buffer = await file.arrayBuffer();
  let pageCount = 0;
  let thumbnail: string | null = null;

  try {
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    pageCount = pdfDoc.getPageCount();
  } catch {
    /* ignore */
  }

  try {
    const loadingTask = pdfjsLib.getDocument({ data: buffer.slice(0) });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    const scale = Math.min(160 / viewport.width, 200 / viewport.height);
    const scaled = page.getViewport({ scale });

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = scaled.width;
    canvas.height = scaled.height;

    // Fix: pass canvas instead of canvasContext
    await page.render({ canvas, viewport: scaled }).promise;

    thumbnail = canvas.toDataURL('image/jpeg', 0.8);
  } catch {
    /* ignore */
  }

  return { id: genId(), file, name: file.name, size: file.size, pageCount, thumbnail };
}
// ─── useDarkMode ───────────────────────────────────────────────────────────
function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const s = localStorage.getItem('pdfmerge-theme');
    if (s) return s === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('pdfmerge-theme', isDark ? 'dark' : 'light');
  }, [isDark]);
  return { isDark, toggle: () => setIsDark(p => !p) };
}

// ─── FAQ Item ──────────────────────────────────────────────────────────────
const faqs = [
  { q: 'How many PDFs can I merge at once?', a: "You can merge as many PDF files as your browser can handle. There's no artificial limit — most modern devices can comfortably merge 10–50 files at once." },
  { q: 'Is my data secure when using this PDF merge tool?', a: 'Absolutely. All PDF merging happens 100% in your browser using client-side JavaScript. Your files are never uploaded to any server, ensuring complete privacy and data security.' },
  { q: 'Do I need to login or create an account?', a: 'No login, no signup, no account needed — ever. Our PDF merge tool is completely free and requires zero registration.' },
  { q: 'Can I merge PDFs on a mobile device?', a: 'Yes! Our PDF merger is fully optimized for mobile phones and tablets. It works on iPhone, Android, iPad, and any device with a modern browser.' },
  { q: 'Are there file size limits for merging PDFs?', a: "There's no hard file size limit imposed by our tool. The practical limit depends on your device's available memory. For very large files (500MB+), we recommend splitting the task." },
  { q: 'Can I rearrange PDFs before merging?', a: 'Yes! After uploading your files, you can drag and drop them to reorder, or use the up/down arrow buttons. The merged PDF will follow your exact ordering.' },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)} aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset">
        <h3 className="text-sm font-semibold text-foreground leading-relaxed">{q}</h3>
        <ChevronDownIcon className={cn('w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && <div className="px-5 pb-5"><p className="text-sm text-muted-foreground leading-relaxed">{a}</p></div>}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function Index() {
  const { isDark, toggle } = useDarkMode();

  // ── File State ────────────────────────────────────────────────────────────
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // ── Merge State ───────────────────────────────────────────────────────────
  const [mergeStatus, setMergeStatus] = useState<MergeStatus>('idle');
  const [mergeProgress, setMergeProgress] = useState(0);
  const [mergeError, setMergeError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const addMoreRef = useRef<HTMLInputElement>(null);

  const hasFiles = files.length > 0;
  const canMerge = files.length >= 2 && mergeStatus !== 'merging';

  // ── Add Files ─────────────────────────────────────────────────────────────
  const addFiles = useCallback(async (incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    const pdfs = arr.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (pdfs.length < arr.length) toast.error('Only PDF files are supported. Non-PDF files were skipped.');
    if (pdfs.length === 0) return;

    setLoadingFiles(true);
    try {
      const processed = await Promise.all(pdfs.map(processPDF));
      setFiles(prev => {
        const unique = processed.filter(p => !prev.some(e => e.name === p.name && e.size === p.size));
        if (unique.length < processed.length) toast.warning('Duplicate files were skipped.');
        if (unique.length > 0) toast.success(`${unique.length} file${unique.length > 1 ? 's' : ''} added.`);
        return [...prev, ...unique];
      });
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  const removeFile = useCallback((id: string) => setFiles(p => p.filter(f => f.id !== id)), []);
  const clearFiles = useCallback(() => { setFiles([]); setMergeStatus('idle'); setMergeProgress(0); setMergeError(null); }, []);
  const reorder = useCallback((from: number, to: number) => {
    setFiles(prev => { const a = [...prev]; const [m] = a.splice(from, 1); a.splice(to, 0, m); return a; });
  }, []);

  // ── Drop Zone handlers ────────────────────────────────────────────────────
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDraggingOver(false);
    if (mergeStatus === 'merging') return;
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  }, [addFiles, mergeStatus]);
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDraggingOver(true); }, []);
  const handleDragLeave = useCallback(() => setIsDraggingOver(false), []);

  // ── File list drag-to-reorder ─────────────────────────────────────────────
  const handleItemDragStart = (e: React.DragEvent<HTMLDivElement>, i: number) => {
    setDraggingIndex(i); e.dataTransfer.effectAllowed = 'move';
  };
  const handleItemDragEnter = (e: React.DragEvent, i: number) => { e.preventDefault(); setDragOverIndex(i); };
  const handleItemDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleItemDrop = (e: React.DragEvent, to: number) => {
    e.preventDefault();
    if (draggingIndex !== null && draggingIndex !== to) reorder(draggingIndex, to);
    setDraggingIndex(null); setDragOverIndex(null);
  };
  const handleItemDragEnd = () => { setDraggingIndex(null); setDragOverIndex(null); };

  // ── Merge ─────────────────────────────────────────────────────────────────
  const handleMerge = async () => {
    if (!canMerge) return;
    setMergeStatus('merging'); setMergeProgress(0); setMergeError(null);
    try {
      const merged = await PDFDocument.create();
      for (let i = 0; i < files.length; i++) {
        const buf = await files[i].file.arrayBuffer();
        const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
        const pages = await merged.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((p: any) => merged.addPage(p));
        setMergeProgress(Math.round(((i + 1) / files.length) * 85));
        await new Promise(r => setTimeout(r, 10));
      }
      setMergeProgress(95);
      const bytes = await merged.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'merged-document.pdf';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMergeProgress(100); setMergeStatus('done');
    } catch (err) {
      console.error(err);
      setMergeError('Failed to merge PDFs. Please ensure all files are valid, unlocked PDFs.');
      setMergeStatus('error');
    }
  };

  const handleReset = () => { clearFiles(); };

  return (
    <div className="min-h-screen bg-background">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 group" aria-label="PDF Merge Tool Home">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">PDF<span className="text-blue-600">Merge</span></span>
          </a>
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            <a href="#tool" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Merge Tool</a>
            <a href="#how-to" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={toggle} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-border hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <a href="#tool" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Merge PDFs Free
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" aria-labelledby="hero-heading">
        <div className="absolute inset-0 z-0">
          <img src={heroBg} alt="PDF merge tool background illustration" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/85 via-indigo-950/80 to-background" />
        </div>

        <div className="relative z-10 container mx-auto max-w-6xl px-4 pt-14 pb-8 sm:pt-20 sm:pb-12">
          {/* ── THE TOOL (MOVED TO TOP) ── */}
          <section id="tool" className="relative w-full max-w-2xl mx-auto mb-12" aria-label="PDF Merge Tool">
            <div className="bg-card border border-border rounded-3xl shadow-2xl shadow-black/20 overflow-hidden">

              {/* Tool header */}
              <div className="px-6 pt-6 pb-4 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">PDF Merge Tool</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {!hasFiles
                        ? 'Upload 2 or more PDF files to get started'
                        : files.length < 2
                          ? `${files.length} file added · Add at least 1 more`
                          : `${files.length} files ready · Drag to reorder`}
                    </p>
                  </div>
                  {hasFiles && mergeStatus !== 'merging' && (
                    <button onClick={clearFiles}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-destructive border border-destructive/20 hover:bg-destructive/10 transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
                      <Trash2 className="w-3.5 h-3.5" />Clear All
                    </button>
                  )}
                </div>
              </div>

              {/* ── DROP ZONE (shown when no files) ── */}
              {!hasFiles && (
                <div className="p-6">
                  <div
                    role="button" tabIndex={mergeStatus === 'merging' ? -1 : 0}
                    aria-label="Upload PDF files by clicking or dragging and dropping"
                    onClick={() => inputRef.current?.click()}
                    onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
                    className={cn(
                      'relative flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 min-h-[260px] p-8 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                      isDraggingOver
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 scale-[1.01] shadow-lg shadow-blue-500/10'
                        : 'border-blue-300 dark:border-blue-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20'
                    )}
                  >
                    {isDraggingOver && <div className="absolute inset-0 rounded-2xl bg-blue-500/5 animate-pulse pointer-events-none" />}

                    <div className={cn('w-20 h-20 rounded-2xl flex items-center justify-center mb-5 transition-all duration-200',
                      isDraggingOver ? 'bg-blue-100 dark:bg-blue-900/50 scale-110' : 'bg-blue-50 dark:bg-blue-950/50 border-2 border-blue-200 dark:border-blue-800')}>
                      <Upload className="w-9 h-9 text-blue-600" />
                    </div>

                    <p className="text-xl font-bold text-foreground mb-2">
                      {isDraggingOver ? 'Drop your PDFs here!' : 'Drag & drop PDF files here'}
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">or click the button below to browse your files</p>

                    {/* BIG PROMINENT BUTTON */}
                    <span className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.99] transition-all pointer-events-none">
                      <Upload className="w-5 h-5" />
                      Select PDF Files
                    </span>

                    <p className="text-xs text-muted-foreground mt-4">Supports multiple PDFs · All processing happens in your browser</p>

                    {loadingFiles && (
                      <div className="absolute inset-0 rounded-2xl bg-background/80 backdrop-blur-sm flex items-center justify-center">
                        <div className="flex items-center gap-3 text-blue-600">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span className="font-semibold">Processing files...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <input ref={inputRef} type="file" accept=".pdf,application/pdf" multiple className="sr-only" aria-hidden="true" tabIndex={-1}
                    onChange={e => { if (e.target.files?.length) { addFiles(e.target.files); e.target.value = ''; } }} />
                </div>
              )}

              {/* ── FILE LIST (shown after upload) ── */}
              {hasFiles && (
                <div className="p-5">
                  {/* Reorder hint */}
                  {files.length > 1 && mergeStatus === 'idle' && (
                    <div className="flex items-center gap-2 mb-4 py-2 px-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                      <ArrowUpDown className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <p className="text-xs text-blue-700 dark:text-blue-400">Drag files or use arrows to reorder before merging</p>
                    </div>
                  )}

                  {/* Cards grid */}
                  <div className="space-y-3" role="list" aria-label="PDF files to merge">
                    {files.map((file, index) => (
                      <div key={file.id} role="listitem" draggable
                        onDragStart={e => handleItemDragStart(e, index)}
                        onDragEnter={e => handleItemDragEnter(e, index)}
                        onDragOver={handleItemDragOver}
                        onDrop={e => handleItemDrop(e, index)}
                        onDragEnd={handleItemDragEnd}
                        className={cn('transition-all duration-150', dragOverIndex === index && draggingIndex !== index ? 'scale-[1.02] opacity-75' : '')}>

                        <div className={cn(
                          'flex items-center gap-3 p-3 rounded-2xl border bg-card transition-all duration-150',
                          draggingIndex === index
                            ? 'border-blue-400 shadow-lg shadow-blue-500/10 bg-blue-50/50 dark:bg-blue-950/30 opacity-50'
                            : 'border-border hover:border-blue-200 hover:shadow-sm'
                        )}>
                          {/* Thumbnail */}
                          <div className="flex-shrink-0 w-14 h-16 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center relative">
                            {file.thumbnail
                              ? <img src={file.thumbnail} alt={`First page of ${file.name}`} className="w-full h-full object-cover" />
                              : <div className="flex flex-col items-center gap-1">
                                  <FileText className="w-6 h-6 text-red-400" />
                                  <span className="text-[9px] font-bold text-red-400 uppercase">PDF</span>
                                </div>
                            }
                            {/* Order badge */}
                            <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow">
                              {index + 1}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate" title={file.name}>{file.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground">{formatSize(file.size)}</span>
                              {file.pageCount > 0 && (
                                <><span className="text-muted-foreground/40">·</span>
                                <span className="text-xs text-muted-foreground">{file.pageCount} {file.pageCount === 1 ? 'page' : 'pages'}</span></>
                              )}
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="flex flex-col gap-0.5 flex-shrink-0">
                            <button onClick={() => reorder(index, index - 1)} disabled={index === 0} aria-label={`Move ${file.name} up`}
                              className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-1 focus:ring-ring">
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => reorder(index, index + 1)} disabled={index === files.length - 1} aria-label={`Move ${file.name} down`}
                              className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-1 focus:ring-ring">
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="hidden sm:flex flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors" aria-hidden="true">
                            <GripVertical className="w-5 h-5" />
                          </div>

                          <button onClick={() => removeFile(file.id)} aria-label={`Remove ${file.name}`}
                            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ── ADD MORE button ── */}
                  {mergeStatus !== 'merging' && mergeStatus !== 'done' && (
                    <div className="mt-4">
                      <button onClick={() => addMoreRef.current?.click()} disabled={loadingFiles}
                        className={cn(
                          'w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-bold text-base transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/30 border-2 border-dashed',
                          'border-blue-400 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/40 hover:border-blue-500 hover:scale-[1.01] active:scale-[0.99]',
                          loadingFiles && 'opacity-60 cursor-not-allowed'
                        )}>
                        {loadingFiles
                          ? <><Loader2 className="w-5 h-5 animate-spin" />Processing...</>
                          : <><Plus className="w-5 h-5" />Add More PDF Files</>}
                      </button>
                      <input ref={addMoreRef} type="file" accept=".pdf,application/pdf" multiple className="sr-only" aria-hidden="true" tabIndex={-1}
                        onChange={e => { if (e.target.files?.length) { addFiles(e.target.files); e.target.value = ''; } }} />
                    </div>
                  )}
                </div>
              )}

              {/* ── MERGE ACTIONS ── */}
              <div className="px-5 pb-6 pt-1">
                {/* Progress */}
                {mergeStatus === 'merging' && (
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        Merging {files.length} PDFs...
                      </span>
                      <span className="font-bold text-blue-600">{mergeProgress}%</span>
                    </div>
                    <div role="progressbar" aria-valuenow={mergeProgress} aria-valuemin={0} aria-valuemax={100}
                      className="w-full h-3 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300 ease-out" style={{ width: `${mergeProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* Success */}
                {mergeStatus === 'done' && (
                  <div className="flex items-center gap-3 p-4 mb-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-green-800 dark:text-green-400">PDF merged successfully!</p>
                      <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">Your download started automatically.</p>
                    </div>
                    <button onClick={handleReset} className="text-xs font-semibold text-green-700 dark:text-green-400 hover:underline focus:outline-none">
                      Merge another
                    </button>
                  </div>
                )}

                {/* Error */}
                {mergeStatus === 'error' && mergeError && (
                  <div className="flex items-start gap-3 p-4 mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-800 dark:text-red-400">Merge failed</p>
                      <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">{mergeError}</p>
                    </div>
                  </div>
                )}

                {/* Merge / Reset button */}
                {mergeStatus !== 'done'
                  ? <button onClick={handleMerge} disabled={!canMerge} aria-label={`Merge ${files.length} PDF files`}
                      className={cn(
                        'w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/30',
                        !canMerge
                          ? 'bg-muted text-muted-foreground cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:scale-[1.01] active:scale-[0.99]'
                      )}>
                      {mergeStatus === 'merging'
                        ? <><Loader2 className="w-5 h-5 animate-spin" />Merging PDFs...</>
                        : <><Download className="w-5 h-5" />{files.length >= 2 ? `Merge ${files.length} PDFs & Download` : 'Merge PDF'}</>}
                    </button>
                  : <button onClick={handleReset}
                      className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/30">
                      <Download className="w-5 h-5" />Start New Merge
                    </button>
                }

                {/* Security note */}
                <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-muted/50">
                  <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">100% secure &amp; private:</strong> All PDF processing happens in your browser. Your files are never uploaded to any server.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-7 mt-16">
            {[
              { icon: Shield, label: '100% Secure — In-Browser' },
              { icon: Zap, label: 'Instant — No Upload' },
              { icon: Star, label: 'Free Forever — No Login' },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 border border-white/20 text-white backdrop-blur-sm">
                <Icon className="w-3.5 h-3.5 text-blue-300" />{label}
              </span>
            ))}
          </div>

          {/* Headline */}
          <div className="text-center mb-10">
            <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-4">
              Merge PDF Files Online
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300 mt-1">
                Free &amp; No Login Required
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-100/80 max-w-2xl mx-auto leading-relaxed">
              Combine multiple PDF files into one in seconds. No signup, no ads, no server uploads —
              just fast, secure, browser-based PDF merging.
            </p>
          </div>

          {/* Microcopy */}
          <p className="text-center text-sm text-blue-200/60 mt-6">No login · Completely free · Ad-free · Fast · Works on all devices</p>
        </div>
      </section>

      {/* ── SEO CONTENT ── */}
      <main id="main-content">
        <div className="container mx-auto max-w-6xl px-4 space-y-20 py-16">

          {/* How to Use */}
          <section id="how-to" aria-labelledby="how-to-heading">
            <div className="text-center mb-10">
              <h2 id="how-to-heading" className="text-3xl font-bold text-foreground mb-3">How to Use the PDF Merge Tool</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Merging PDF files online has never been easier. Follow these four simple steps to combine your documents in seconds.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: '01', title: 'Upload PDF Files', desc: 'Drag and drop your PDF files into the tool or click "Select PDF Files" to browse from your device. Add multiple files at once.' },
                { step: '02', title: 'Preview & Arrange', desc: 'See a thumbnail preview of each PDF first page. Drag and reorder or use arrow buttons to set your desired order.' },
                { step: '03', title: 'Click Merge PDF', desc: 'Hit the "Merge PDFs & Download" button. Our tool instantly combines all your files directly in your browser.' },
                { step: '04', title: 'Download Your PDF', desc: 'Your merged PDF downloads automatically. Done! The whole process takes just seconds, even for large files.' },
              ].map(item => (
                <div key={item.step} className="relative p-6 rounded-2xl border border-border bg-card hover:border-blue-200 hover:shadow-md transition-all group">
                  <div className="text-5xl font-black text-blue-600/10 group-hover:text-blue-600/20 transition-colors leading-none mb-4">{item.step}</div>
                  <h3 className="text-base font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section id="features" aria-labelledby="features-heading">
            <div className="text-center mb-10">
              <h2 id="features-heading" className="text-3xl font-bold text-foreground mb-3">Features of the PDF Merge Tool</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to merge PDFs online — fast, free, and without compromising your privacy.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: Zap, title: 'Lightning Fast', desc: 'Merge PDFs in seconds with our optimized browser-based engine.' },
                { icon: Shield, title: 'Secure & Private', desc: 'Files never leave your device. Zero server uploads, ever.' },
                { icon: FileText, title: 'PDF Thumbnails', desc: 'Preview the first page of each file so you always merge the right documents.' },
                { icon: ArrowUpDown, title: 'Drag & Reorder', desc: 'Rearrange files visually with drag-and-drop or up/down arrows.' },
                { icon: Upload, title: 'Drag & Drop Upload', desc: 'Simply drag files into the tool or browse your device with ease.' },
                { icon: Download, title: 'Instant Download', desc: 'One click to merge and download — no waiting, no email, no signups.' },
              ].map(f => (
                <div key={f.title} className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card hover:border-blue-200 hover:shadow-md transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                    <f.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Benefits */}
          <section id="benefits" aria-labelledby="benefits-heading" className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-3xl p-8 sm:p-12 border border-blue-100 dark:border-blue-900/30">
            <div className="text-center mb-10">
              <h2 id="benefits-heading" className="text-3xl font-bold text-foreground mb-3">Benefits of Using Our PDF Merge Tool</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Why choose our free PDF merger over desktop apps or competitor tools?</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: Zap, title: 'Save Time', desc: 'No software to install. Open the browser, upload, and merge in under 30 seconds.' },
                { icon: FileText, title: 'No Software Needed', desc: 'Works on any device with a modern browser — no downloads, no installation.' },
                { icon: Shield, title: 'Data Privacy First', desc: 'Your documents are processed locally. We never see, store, or access your files.' },
                { icon: Star, title: 'For Everyone', desc: 'Perfect for students, professionals, and anyone who handles PDF documents regularly.' },
              ].map(b => (
                <div key={b.title} className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-card border border-white dark:border-border shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <b.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1.5">{b.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <p className="text-lg font-semibold text-foreground mb-1">No login. Completely free. Ad-free. And fast.</p>
              <p className="text-muted-foreground text-sm mb-5">Drag, merge, download — it's that simple.</p>
              <a href="#tool" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/30">
                Merge My PDFs Now — It's Free
              </a>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" aria-labelledby="faq-heading">
            <div className="text-center mb-10">
              <h2 id="faq-heading" className="text-3xl font-bold text-foreground mb-3">Frequently Asked Questions</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to know about merging PDFs online for free with no login required.</p>
            </div>
            <div className="max-w-3xl mx-auto space-y-3">
              {faqs.map(faq => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}
            </div>
          </section>

          {/* Long-form SEO */}
          <section className="max-w-3xl mx-auto" aria-labelledby="about-heading">
            <h2 id="about-heading" className="text-2xl font-bold text-foreground mb-4">The Best Free PDF Merge Tool Online</h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-7">
              <p>Looking for the fastest way to <strong className="text-foreground">merge PDF files online free</strong>? You've found it. Our PDF merge tool combines multiple PDF documents into one seamless file — instantly, securely, and without any login required.</p>
              <p>Unlike other online PDF combiners that require account registration or charge fees, our <strong className="text-foreground">PDF merger online without ads</strong> delivers a clean, distraction-free experience with visual file previews so you always merge the right documents.</p>
              <p>Our tool uses cutting-edge browser technology to process all files locally on your device. This means your sensitive documents are <em>never transmitted to any external server</em>, making it the most secure <strong className="text-foreground">online PDF combiner</strong> available.</p>
              <p>Ready to <strong className="text-foreground">merge PDFs instantly</strong>? Scroll up and start merging — no registration, no payment, no hassle.</p>
            </div>
          </section>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-muted/30 border-t border-border mt-4">
        <section id="related-tools" className="container mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Related Tools</h2>
          <p className="text-muted-foreground text-center mb-8">More free PDF tools, no login required</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Scissors, label: 'PDF Split Tool', href: '/pdf-split', desc: 'Split one PDF into multiple files' },
              { icon: Archive, label: 'PDF Compress Tool', href: '/pdf-compress', desc: 'Reduce PDF file size instantly' },
              { icon: FileType2, label: 'PDF to Word', href: '/pdf-to-word', desc: 'Convert PDF to editable Word doc' },
            ].map(tool => (
              <a key={tool.href} href={tool.href}
                className="group flex items-start gap-4 p-5 rounded-xl border border-border bg-card hover:border-blue-400 hover:shadow-md transition-all" aria-label={tool.label}>
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                  <tool.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-foreground group-hover:text-blue-600 transition-colors">{tool.label}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{tool.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
        <div className="border-t border-border">
          <div className="container mx-auto max-w-6xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <FileText className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-semibold text-foreground">PDF<span className="text-blue-600">Merge</span></span>
            </div>
            <p className="text-sm text-muted-foreground text-center">Free, ad-free, and no login required. Your files never leave your device.</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
