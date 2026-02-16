import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AlertCircle, Vote, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StepIndicator from "@/components/StepIndicator";
import PartySelector from "@/components/PartySelector";
import {
  PROVINCES,
  MUNICIPALITIES,
  NATIONAL_PARTIES,
  REGIONAL_PARTIES,
  validateSAID,
  maskSAID,
  type Province,
} from "@/lib/sa-data";

const STEPS = ["Identity", "Location", "National", "Regional", "Provincial", "Confirm"];

const VotePage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [idNumber, setIdNumber] = useState("");
  const [idError, setIdError] = useState("");
  const [province, setProvince] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [ward, setWard] = useState("");
  const [nationalParty, setNationalParty] = useState("");
  const [regionalCandidate, setRegionalCandidate] = useState("");
  const [provincialCandidate, setProvincialCandidate] = useState("");

  const handleIdChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 13);
    setIdNumber(digits);
    setIdError("");
  };

  const canNext = (): boolean => {
    switch (step) {
      case 0:
        return idNumber.length === 13 && validateSAID(idNumber);
      case 1:
        return !!province && !!municipality && ward.trim().length > 0;
      case 2:
        return !!nationalParty;
      case 3:
        return !!regionalCandidate;
      case 4:
        return !!provincialCandidate;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (step === 0 && !validateSAID(idNumber)) {
      setIdError("Please enter a valid 13-digit South African ID number.");
      return;
    }
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:8000/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_number: idNumber,
          province,
          municipality,
          ward,
          national_party: nationalParty,
          regional_candidate: regionalCandidate,
          provincial_candidate: provincialCandidate,
        }),
      });

      if (res.status === 400) {
        toast.error("Invalid ID Number", { description: "The ID number you entered could not be verified." });
      } else if (res.status === 403) {
        toast.error("Already Voted", { description: "Records indicate you have already cast your vote." });
      } else if (res.ok) {
        toast.success("Vote Submitted Successfully", { description: "Thank you for exercising your democratic right." });
        navigate("/results");
      } else {
        toast.error("Submission Error", { description: "An unexpected error occurred. Please try again." });
      }
    } catch {
      toast.error("Connection Error", { description: "Unable to reach the voting server. Please try again later." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-display font-bold text-foreground">
          2024 National &amp; Provincial Elections
        </h1>
        <p className="text-muted-foreground mt-1">Secure Digital Ballot</p>
      </div>

      <StepIndicator steps={STEPS} currentStep={step} />

      <div className="bg-card rounded-lg border shadow-sm p-6 min-h-[340px]">
        {/* Step 0: Identity */}
        {step === 0 && (
          <div>
            <h2 className="text-2xl font-display font-bold mb-1">Voter Identification</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Enter your 13-digit South African Identity Number.
            </p>
            <div className="space-y-2 max-w-sm">
              <Label htmlFor="sa-id">SA ID Number</Label>
              <Input
                id="sa-id"
                type="text"
                inputMode="numeric"
                placeholder="e.g. 9001015009087"
                value={idNumber}
                onChange={(e) => handleIdChange(e.target.value)}
                maxLength={13}
                className="text-lg tracking-widest font-mono"
              />
              {idNumber.length > 0 && (
                <p className="text-xs text-muted-foreground font-mono">
                  Masked: {maskSAID(idNumber)}
                </p>
              )}
              {idError && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {idError}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 1: Location */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-display font-bold mb-1">Voting Location</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Select your province, municipality, and ward.
            </p>
            <div className="space-y-4 max-w-sm">
              <div className="space-y-2">
                <Label>Province</Label>
                <Select
                  value={province}
                  onValueChange={(v) => {
                    setProvince(v);
                    setMunicipality("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVINCES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Municipality</Label>
                <Select
                  value={municipality}
                  onValueChange={setMunicipality}
                  disabled={!province}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select municipality" />
                  </SelectTrigger>
                  <SelectContent>
                    {province &&
                      MUNICIPALITIES[province as Province]?.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ward">Ward</Label>
                <Input
                  id="ward"
                  placeholder="e.g. Ward 42"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: National Ballot */}
        {step === 2 && (
          <PartySelector
            parties={NATIONAL_PARTIES}
            selected={nationalParty}
            onSelect={setNationalParty}
            title="Ballot 1 — National Assembly"
            subtitle="Select one party for the National Assembly."
          />
        )}

        {/* Step 3: Regional Ballot */}
        {step === 3 && (
          <PartySelector
            parties={REGIONAL_PARTIES}
            selected={regionalCandidate}
            onSelect={setRegionalCandidate}
            title="Ballot 2 — Regional"
            subtitle="Select one party or independent candidate for your region."
          />
        )}

        {/* Step 4: Provincial Ballot */}
        {step === 4 && (
          <PartySelector
            parties={NATIONAL_PARTIES}
            selected={provincialCandidate}
            onSelect={setProvincialCandidate}
            title={`Ballot 3 — ${province || "Provincial"} Legislature`}
            subtitle={`Select one party for the ${province || "Provincial"} Legislature.`}
          />
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <div>
            <h2 className="text-2xl font-display font-bold mb-1">Confirm Your Vote</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Please review your selections carefully before submitting.
            </p>
            <div className="space-y-3 text-sm">
              {[
                ["ID Number", maskSAID(idNumber)],
                ["Province", province],
                ["Municipality", municipality],
                ["Ward", ward],
                ["National Assembly", nationalParty],
                ["Regional", regionalCandidate],
                [`${province} Legislature`, provincialCandidate],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground font-medium">{label}</span>
                  <span className="font-semibold text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 0}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            onClick={handleNext}
            disabled={!canNext()}
            className="gap-1 bg-primary text-primary-foreground hover:bg-navy-light"
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="gap-2 gradient-gold text-accent-foreground font-bold hover:opacity-90"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Vote className="w-4 h-4" />
            )}
            Submit Vote
          </Button>
        )}
      </div>
    </div>
  );
};

export default VotePage;
