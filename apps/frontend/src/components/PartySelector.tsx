import { Check } from "lucide-react";

interface PartySelectorProps {
  parties: readonly string[];
  selected: string;
  onSelect: (party: string) => void;
  title: string;
  subtitle: string;
}

const PARTY_COLORS: Record<string, string> = {
  "African National Congress (ANC)": "bg-emerald-700",
  "Democratic Alliance (DA)": "bg-blue-600",
  "Economic Freedom Fighters (EFF)": "bg-red-600",
  "uMkhonto weSizwe (MK)": "bg-amber-800",
  "ActionSA": "bg-purple-700",
  "Inkatha Freedom Party (IFP)": "bg-red-800",
  "Freedom Front Plus (FF+)": "bg-orange-600",
  "Patriotic Alliance (PA)": "bg-teal-700",
  "Independent Candidate": "bg-gray-600",
};

const PartySelector = ({ parties, selected, onSelect, title, subtitle }: PartySelectorProps) => (
  <div>
    <h2 className="text-2xl font-display font-bold text-foreground mb-1">{title}</h2>
    <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>
    <div className="grid gap-2">
      {parties.map((party) => {
        const isSelected = selected === party;
        return (
          <button
            key={party}
            onClick={() => onSelect(party)}
            className={`flex items-center gap-3 p-4 rounded-md border-2 text-left transition-all ${
              isSelected
                ? "border-accent bg-accent/10 shadow-sm"
                : "border-border bg-card hover:border-accent/50 hover:shadow-sm"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0 ${
                PARTY_COLORS[party] || "bg-primary"
              }`}
            >
              {party.charAt(0)}
            </div>
            <span className="font-medium text-card-foreground flex-1">{party}</span>
            {isSelected && (
              <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                <Check className="w-4 h-4 text-accent-foreground" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  </div>
);

export default PartySelector;
