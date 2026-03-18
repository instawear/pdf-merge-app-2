import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Shield, Zap, FileText, ChevronDown as ChevronDownIcon, Download, Image, Layers, Smartphone, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import ImageToPDFTool from '@/components/features/ImageToPDFTool';

// ─── FAQ Item ──────────────────────────────────────────────────────────────
const faqs = [
  { q: 'What image formats are supported?', a: 'We support JPG, PNG, GIF, WebP, BMP, and TIFF. You can convert any of these formats to PDF in seconds.' },
  { q: 'Can I convert multiple images at once?', a: 'Yes! Upload as many images as you want and they will be combined into a single PDF file in the order you arrange them.' },
  { q: 'Is my data secure?', a: 'Absolutely. All image-to-PDF conversions happen 100% in your browser. Your images never leave your device or reach any server.' },
  { q: 'Do I need to create an account?', a: 'No account needed! Our image to PDF converter is completely free and requires zero registration.' },
  { q: 'What page sizes are available?', a: 'You can choose between Auto (fits image dimensions), A4, or Letter size for your PDF pages.' },
  { q: 'Can I rearrange images before converting?', a: 'Yes! Drag and drop images to reorder them, or use the up/down arrow buttons to adjust the sequence.' },
  { q: 'Can I convert images on mobile?', a: 'Yes! Our image to PDF converter works perfectly on all devices including phones, tablets, and desktops.' },
  { q: 'Are there file size limits?', a: 'No hard limits. The practical limit depends on your device memory. Large batches of high-resolution images may take longer to process.' },
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

export default function ImageToPDFPage() {
  const { isDark, toggle } = useDarkMode();

  return (
    <div className="min-h-screen bg-background">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="Home">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">PDF<span className="text-blue-600">Merge</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">PDF Merger</Link>
            <Link to="/image-to-pdf" className="text-sm font-medium text-blue-600">Image to PDF</Link>
            <a href="#how-to" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={toggle} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-border hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" aria-labelledby="hero-heading">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/85 via-indigo-950/80 to-background" />
        </div>

        <div className="relative z-10 container mx-auto max-w-6xl px-4 pt-14 pb-8 sm:pt-20 sm:pb-12">
          {/* ── THE TOOL (MOVED TO TOP) ── */}
          <div className="w-full max-w-4xl mx-auto mb-12">
            <ImageToPDFTool />
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-7 mt-16">
            {[
              { icon: Shield, label: '100% Secure — In-Browser' },
              { icon: Zap, label: 'Instant — No Upload' },
              { icon: FileText, label: 'Free Forever — No Login' },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 border border-white/20 text-white backdrop-blur-sm">
                <Icon className="w-3.5 h-3.5 text-blue-300" />{label}
              </span>
            ))}
          </div>

          {/* Headline */}
          <div className="text-center mb-10">
            <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-8">
              <span className="text-white block">Convert Images to PDF Online</span>
              <span className="block text-blue-400 mt-2">Free & No Login Required</span>
            </h1>
            <div className="inline-block max-w-3xl">
              <p className="text-lg sm:text-xl text-white leading-relaxed font-medium">
                🖼️ Convert any image into a professional PDF in seconds.<br />
                🔒 No upload to servers — everything stays on your device.<br />
                ⚡ Reorder, resize, and download instantly.
              </p>
            </div>
          </div>

          {/* Microcopy with Icons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 text-gray-900 text-sm font-semibold shadow-lg border border-white/50">
              🔓 No login
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 text-gray-900 text-sm font-semibold shadow-lg border border-white/50">
              💰 Completely free
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 text-gray-900 text-sm font-semibold shadow-lg border border-white/50">
              🚫 Ad-free
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 text-gray-900 text-sm font-semibold shadow-lg border border-white/50">
              ⚡ Fast
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 text-gray-900 text-sm font-semibold shadow-lg border border-white/50">
              📱 All devices
            </span>
          </div>
        </div>
      </section>

      {/* ── SEO CONTENT ── */}
      <main id="main-content">
        <div className="container mx-auto max-w-6xl px-4 space-y-20 py-16">

          {/* How to Use */}
          <section id="how-to" aria-labelledby="how-to-heading">
            <div className="text-center mb-10">
              <h2 id="how-to-heading" className="text-3xl font-bold text-foreground mb-3">How to Convert Images to PDF</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Converting images to PDF is simple, fast, and secure. Follow these four easy steps.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: '01', title: 'Upload Images', desc: 'Drag and drop multiple image files or click to browse. Supports JPG, PNG, GIF, WebP, BMP, and TIFF formats.' },
                { step: '02', title: 'Arrange Order', desc: 'Preview your images and drag them to reorder. Use arrow buttons to adjust the sequence for your PDF.' },
                { step: '03', title: 'Choose Layout', desc: 'Select your preferred page size: Auto (fits image), A4, or Letter. Process begins immediately in your browser.' },
                { step: '04', title: 'Download PDF', desc: 'Your PDF downloads automatically. All images are merged and ready to use, view, or share instantly.' },
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
              <h2 id="features-heading" className="text-3xl font-bold text-foreground mb-3">Why Choose Our Image to PDF Converter</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Powerful features designed for speed, security, and ease of use.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: Lock, title: 'Fully Secure', desc: 'No server uploads. Your images stay on your device. 100% private and secure.' },
                { icon: Zap, title: 'Lightning Fast', desc: 'Convert multiple images to PDF instantly with our optimized browser engine.' },
                { icon: Image, title: 'Multiple Formats', desc: 'Support for JPG, PNG, GIF, WebP, BMP, and TIFF image formats.' },
                { icon: Layers, title: 'Easy Reordering', desc: 'Drag and drop or use arrow buttons to arrange images in any order.' },
                { icon: Download, title: 'Instant Download', desc: 'One click to convert and download your PDF without waiting.' },
                { icon: Smartphone, title: 'Mobile Friendly', desc: 'Works perfectly on phones, tablets, and desktop computers.' },
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

          {/* Key Benefits */}
          <section aria-labelledby="benefits-heading" className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-3xl p-8 sm:p-12 border border-blue-100 dark:border-blue-900/30">
            <div className="text-center mb-10">
              <h2 id="benefits-heading" className="text-3xl font-bold text-foreground mb-3">Benefits of Image to PDF Conversion</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: '📄 Professional Documents', desc: 'Convert screenshots, photos, and art into professional PDF documents.' },
                { title: '🔐 Privacy Protected', desc: 'All processing happens locally. No data collection or tracking.' },
                { title: '⚡ Time Saving', desc: 'Instant conversion. No waiting, no uploads, no complicated steps.' },
                { title: '📤 Easy Sharing', desc: 'PDF format is universally compatible. Share with anyone, open anywhere.' },
                { title: '🎨 High Quality', desc: 'Maintains image quality with smart compression and sizing.' },
                { title: '♾️ Unlimited Usage', desc: 'Convert as many images as you want, whenever you want, for free.' },
              ].map((benefit, i) => (
                <div key={i} className="p-6 rounded-2xl border border-blue-200/50 dark:border-blue-900/30 bg-white/50 dark:bg-black/20">
                  <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" aria-labelledby="faq-heading">
            <div className="text-center mb-10">
              <h2 id="faq-heading" className="text-3xl font-bold text-foreground mb-3">Frequently Asked Questions</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to know about converting images to PDF.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 max-w-2xl mx-auto">
              {faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Convert Images to PDF?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">Start converting your images now. It's free, fast, and completely secure.</p>
            <a href="#tool" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Convert Images Now
            </a>
          </section>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border/50 bg-muted/30 py-8">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Made with ❤️ for secure, browser-based image to PDF conversion. No ads, no tracking, completely free.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-4">
            © 2024 PDFMerge. All rights reserved. Your privacy is our priority.
          </p>
        </div>
      </footer>
    </div>
  );
}
