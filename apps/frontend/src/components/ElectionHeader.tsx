import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react"; // Install with: npm install lucide-react

const ElectionHeader = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { to: "/", label: "Vote" },
    { to: "/results", label: "Live Results" },
    { to: "/iec", label: "About IEC" },
  ];

  return (
    // 'sticky top-0' keeps it pinned; 'z-50' ensures it stays above page content
    <header className="sticky top-0 z-50 w-full gradient-navy border-b-4 border-gold backdrop-blur-md bg-opacity-90">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-gold shadow-inner">
            <img
              src="/logos/iec.png"
              alt="IEC Logo"
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.nextElementSibling?.classList.remove("hidden");
              }}
            />
            <span className="hidden text-navy font-bold text-sm md:text-lg">IEC</span>
          </div>
          <div>
            <h1 className="text-sm md:text-lg font-display font-bold text-primary-foreground leading-tight">
              Electoral Commission
            </h1>
            <p className="text-[10px] md:text-xs text-gold-light tracking-widest uppercase">
              Republic of South Africa
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-1">
          {navItems.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 rounded text-sm font-medium transition-all duration-200 ${
                location.pathname === to
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-primary-foreground p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMenuOpen && (
        <nav className="md:hidden bg-navy-dark border-t border-gold/30 flex flex-col p-4 gap-2 animate-in slide-in-from-top duration-300">
          {navItems.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setIsMenuOpen(false)}
              className={`px-4 py-3 rounded text-base font-medium ${
                location.pathname === to
                  ? "bg-accent text-accent-foreground"
                  : "text-primary-foreground/80"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default ElectionHeader;