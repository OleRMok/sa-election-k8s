import { Link, useLocation } from "react-router-dom";

const ElectionHeader = () => {
  const location = useLocation();

  const navItems = [
    { to: "/", label: "Vote" },
    { to: "/results", label: "Live Results" },
    { to: "/iec", label: "About IEC" },
  ];

  return (
    <header className="gradient-navy border-b-4 border-gold">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-gold">
            <img
              src="/logos/iec.png"
              alt="IEC Logo"
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
              }}
            />
            <span className="hidden text-navy font-bold text-lg">IEC</span>
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
          {navItems.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                location.pathname === to
                  ? "bg-accent text-accent-foreground"
                  : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default ElectionHeader;
