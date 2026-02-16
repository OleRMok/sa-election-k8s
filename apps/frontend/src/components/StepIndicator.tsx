import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => (
  <div className="flex items-center justify-center gap-1 mb-8">
    {steps.map((label, i) => {
      const done = i < currentStep;
      const active = i === currentStep;
      return (
        <div key={label} className="flex items-center gap-1">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                done
                  ? "bg-accent text-accent-foreground"
                  : active
                  ? "bg-primary text-primary-foreground ring-2 ring-accent ring-offset-2 ring-offset-background"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {done ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
                active ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-8 h-0.5 mb-4 ${
                done ? "bg-accent" : "bg-muted"
              }`}
            />
          )}
        </div>
      );
    })}
  </div>
);

export default StepIndicator;
