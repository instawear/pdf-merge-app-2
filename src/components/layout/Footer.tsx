import { FileText, Scissors, Archive, FileType2 } from 'lucide-react';

export default function Footer() {
  const relatedTools = [
    { icon: Scissors, label: 'PDF Split Tool', href: '/pdf-split', desc: 'Split one PDF into multiple files' },
    { icon: Archive, label: 'PDF Compress Tool', href: '/pdf-compress', desc: 'Reduce PDF file size instantly' },
    { icon: FileType2, label: 'PDF to Word', href: '/pdf-to-word', desc: 'Convert PDF to editable Word doc' },
  ];

  return (
    <footer className="bg-muted/30 border-t border-border mt-16">
      {/* Related Tools */}
      <section id="related-tools" className="container mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Related Tools</h2>
        <p className="text-muted-foreground text-center mb-8">More free PDF tools, no login required</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {relatedTools.map(tool => (
            <a
              key={tool.href}
              href={tool.href}
              className="group flex items-start gap-4 p-5 rounded-xl border border-border bg-card hover:border-blue-400 hover:shadow-md transition-all"
              aria-label={tool.label}
            >
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

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="container mx-auto max-w-6xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <FileText className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">PDF<span className="text-blue-600">Merge</span></span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Free, ad-free, and no login required. Your files never leave your device.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
