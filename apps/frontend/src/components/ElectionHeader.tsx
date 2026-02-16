import { Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const ElectionHeader = () => {
  const location = useLocation();

  return (
    <header className="gradient-navy border-b-4 border-gold">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center">
            <Shield className="w-7 h-7 text-navy" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-primary-foreground leading-tight">
              Electoral Commission
            </h1>
            <p className="text-xs text-gold-light tracking-widest uppercase">
              Republic of South Africa
            </p>
          </div>
        </Link>
        <nav className="flex gap-1">
          <Link
            to="/"
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              location.pathname === "/"
                ? "bg-accent text-accent-foreground"
                : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
            }`}
          >
            Vote
          </Link>
          <Link
            to="/results"
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              location.pathname === "/results"
                ? "bg-accent text-accent-foreground"
                : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
            }`}
          >
            Live Results
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default ElectionHeader;
