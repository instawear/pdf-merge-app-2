import { Moon, Sun, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  isDark: boolean;
  onToggleDark: () => void;
}

export default function Navbar({ isDark, onToggleDark }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="PDF Merge Tool Home">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-foreground">
            PDF<span className="text-blue-600">Merge</span>
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          <a href="#tool" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Merge Tool</a>
          <Link to="/image-to-pdf" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Image to PDF</Link>
          <a href="#how-to" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleDark}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-border hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <a
            href="#tool"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Merge PDFs Free
          </a>
        </div>
      </div>
    </header>
  );
}
