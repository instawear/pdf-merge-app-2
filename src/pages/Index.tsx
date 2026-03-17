import { useState, useEffect } from 'react';
import { Moon, Sun, Shield, Star, Zap, FileText, Scissors, Archive, FileType2, ChevronDown as ChevronDownIcon, ArrowUpDown, Upload, Download } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';
import { cn } from '@/lib/utils';
import PDFMergeTool from '@/components/features/PDFMergeTool';


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

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function Index() {
  const { isDark, toggle } = useDarkMode();

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
          <div className="w-full max-w-4xl mx-auto mb-12">
            <PDFMergeTool />
          </div>

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
            <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-8">
              <span className="text-white block">Merge PDF Files Online</span>
              <span className="block text-blue-400 mt-2">Free &amp; No Login Required</span>
            </h1>
            <div className="inline-block max-w-3xl">
              <p className="text-2xl sm:text-3xl lg:text-4xl text-white leading-relaxed font-bold tracking-tight" style={{
                textShadow: `
                  0 2px 4px rgba(0, 0, 0, 0.8),
                  0 4px 8px rgba(59, 130, 246, 0.6),
                  0 8px 16px rgba(99, 102, 241, 0.4),
                  0 12px 24px rgba(0, 0, 0, 0.5),
                  0 0 20px rgba(59, 130, 246, 0.3)
                `
              }}>
                💨 Combine multiple PDF files into one in seconds.<br />
                🔒 No signup, no ads, no server uploads —<br />
                ⚡ just fast, secure, browser-based PDF merging.
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
              📱 Works on all devices
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
