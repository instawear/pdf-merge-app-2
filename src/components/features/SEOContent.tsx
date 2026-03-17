import { useState } from 'react';
import {
  Zap, Shield, Smartphone, MousePointer, Eye, ArrowLeftRight,
  Clock, Laptop, Lock, GraduationCap, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  { icon: Zap, title: 'Lightning Fast', desc: 'Merge PDFs in seconds with our optimized browser-based engine.' },
  { icon: Shield, title: 'Secure & Private', desc: 'Files never leave your device. Zero server uploads, ever.' },
  { icon: Smartphone, title: 'Works on Mobile', desc: 'Fully optimized for iOS and Android — merge on the go.' },
  { icon: MousePointer, title: 'Drag & Drop', desc: 'Simply drag files into the tool or browse your device.' },
  { icon: Eye, title: 'Preview & Reorder', desc: 'See file names and page counts before you merge.' },
  { icon: ArrowLeftRight, title: 'Custom Order', desc: 'Rearrange PDFs in any order before combining them.' },
];

const benefits = [
  { icon: Clock, title: 'Save Time', desc: 'No software to install. Open the browser, upload, and merge in under 30 seconds.' },
  { icon: Laptop, title: 'No Software Needed', desc: 'Works on any device with a modern browser — no downloads, no installation.' },
  { icon: Lock, title: 'Data Privacy First', desc: 'Your documents are processed locally. We never see, store, or access your files.' },
  { icon: GraduationCap, title: 'For Everyone', desc: 'Perfect for students, professionals, and anyone who handles PDF documents.' },
];

const faqs = [
  {
    q: 'How many PDFs can I merge at once?',
    a: "You can merge as many PDF files as your browser can handle. There's no artificial limit — most modern devices can comfortably merge 10–50 files at once.",
  },
  {
    q: 'Is my data secure when using this PDF merge tool?',
    a: 'Absolutely. All PDF merging happens 100% in your browser using client-side JavaScript. Your files are never uploaded to any server, ensuring complete privacy and data security.',
  },
  {
    q: 'Do I need to login or create an account?',
    a: 'No login, no signup, no account needed — ever. Our PDF merge tool is completely free and requires zero registration.',
  },
  {
    q: 'Can I merge PDFs on a mobile device?',
    a: 'Yes! Our PDF merger is fully optimized for mobile phones and tablets. It works on iPhone, Android, iPad, and any device with a modern browser.',
  },
  {
    q: 'Are there file size limits for merging PDFs?',
    a: "There's no hard file size limit imposed by our tool. The practical limit depends on your device's available memory. For very large files (500MB+), we recommend splitting the task.",
  },
  {
    q: 'Can I rearrange PDFs before merging?',
    a: 'Yes! After uploading your files, you can drag and drop them to reorder, or use the up/down arrow buttons. The merged PDF will follow your exact ordering.',
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset"
      >
        <h3 className="text-sm font-semibold text-foreground leading-relaxed">{question}</h3>
        <ChevronDown className={cn('w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function SEOContent() {
  return (
    <div className="container mx-auto max-w-6xl px-4 space-y-20 py-16">

      {/* How to Use */}
      <section id="how-to" aria-labelledby="how-to-heading">
        <div className="text-center mb-10">
          <h2 id="how-to-heading" className="text-3xl font-bold text-foreground mb-3">How to Use the PDF Merge Tool</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Merging PDF files online has never been easier. Follow these four simple steps to combine your documents in seconds — no software, no signup required.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Upload PDF Files', desc: 'Drag and drop your PDF files into the tool or click "Upload PDFs" to browse from your device. You can add multiple files at once.' },
            { step: '02', title: 'Arrange the Order', desc: 'Drag and rearrange the uploaded PDFs into your desired order. Use the arrow buttons for precise control on mobile devices.' },
            { step: '03', title: 'Click Merge PDF', desc: 'Hit the "Merge PDF" button. Our tool instantly combines all your files directly in your browser — no upload needed.' },
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
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to merge PDFs online — fast, free, and without compromising your privacy. No other tool does it better.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(f => (
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
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Why choose our free PDF merger over desktop apps or competitor tools? Here's what makes us the best PDF merge tool online.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {benefits.map(b => (
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

        {/* CTA Banner */}
        <div className="mt-10 text-center">
          <p className="text-lg font-semibold text-foreground mb-1">No login. Completely free. Ad-free. And fast.</p>
          <p className="text-muted-foreground text-sm mb-5">Drag, merge, download — it's that simple.</p>
          <a
            href="#tool"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/30"
          >
            Merge My PDFs Now — It's Free
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" aria-labelledby="faq-heading">
        <div className="text-center mb-10">
          <h2 id="faq-heading" className="text-3xl font-bold text-foreground mb-3">Frequently Asked Questions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about merging PDFs online for free with no login required.
          </p>
        </div>
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map(faq => (
            <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </section>

      {/* Long-form SEO Content */}
      <section className="max-w-3xl mx-auto prose-like" aria-labelledby="about-heading">
        <h2 id="about-heading" className="text-2xl font-bold text-foreground mb-4">The Best Free PDF Merge Tool Online</h2>
        <div className="space-y-4 text-sm text-muted-foreground leading-7">
          <p>
            Looking for the fastest way to <strong className="text-foreground">merge PDF files online free</strong>? You've found it. Our PDF merge tool combines multiple PDF documents into one seamless file — instantly, securely, and without any login required. Whether you're a student assembling research papers, a professional combining reports, or anyone who needs to <strong className="text-foreground">combine PDFs no login</strong>, this tool was built for you.
          </p>
          <p>
            Unlike other online PDF combiners that require account registration, charge subscription fees, or display intrusive ads, our <strong className="text-foreground">PDF merger online without ads</strong> delivers a clean, distraction-free experience. Simply drag and drop your files, arrange them in the order you want, click merge, and download your combined PDF — all in just a few seconds.
          </p>
          <p>
            Our tool uses cutting-edge browser technology to process all files locally on your device. This means your sensitive documents are <em>never transmitted to any external server</em>, making it the most secure <strong className="text-foreground">online PDF combiner</strong> available. Perfect for confidential business documents, legal files, financial statements, and personal records.
          </p>
          <p>
            The <strong className="text-foreground">easy PDF merge tool</strong> supports all modern browsers including Chrome, Firefox, Safari, and Edge on desktop, tablet, and mobile. With our mobile-optimized interface, you can <strong className="text-foreground">merge PDFs on mobile</strong> just as effortlessly as on a laptop. Touch gestures, large tap targets, and a responsive design ensure a smooth experience on any screen size.
          </p>
          <p>
            Ready to <strong className="text-foreground">merge PDFs instantly</strong>? Scroll up and start merging — no registration, no payment, no hassle. It's the <strong className="text-foreground">fast PDF merge online</strong> solution you've been looking for, and it's completely free.
          </p>
        </div>
      </section>
    </div>
  );
}
