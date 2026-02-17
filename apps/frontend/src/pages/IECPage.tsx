import { Shield, Phone, Globe, Mail, CheckCircle, AlertCircle, Info } from "lucide-react";

const IECPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">

      {/* Header with IEC branding */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="w-28 h-28 mb-4 rounded-full overflow-hidden border-4 border-primary/20 shadow-md bg-white flex items-center justify-center">
          <img
            src="/logos/iec.png"
            alt="IEC Logo"
            className="w-full h-full object-contain p-2"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Electoral Commission of South Africa
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl text-sm">
          The IEC is an independent body established in terms of Chapter 9 of the Constitution of the Republic of South Africa, 1996.
        </p>
        <div className="flex items-center gap-2 mt-3 px-4 py-1.5 bg-green-50 border border-green-200 rounded-full">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-green-700 text-sm font-medium">Certified Secure Voting Platform</span>
        </div>
      </div>

      {/* Mission & Mandate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-lg border shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-display font-bold text-lg">Our Mandate</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To manage elections of national, provincial and municipal legislative bodies in accordance with national legislation, to ensure that those elections are free and fair, and to declare the results of those elections within a period that must be prescribed by national legislation.
          </p>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-display font-bold text-lg">About This Platform</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This digital voting platform is a secure, POPIA-compliant system for casting your vote in the 2024 National and Provincial Elections. Your identity is protected using one-way cryptographic hashing to prevent duplicate voting while preserving your anonymity.
          </p>
        </div>
      </div>

      {/* Voter Rights */}
      <div className="bg-card rounded-lg border shadow-sm p-6 mb-8">
        <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary" />
          Your Voter Rights
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            "Every citizen 18 years or older has the right to vote",
            "Your vote is secret and cannot be traced back to you",
            "You may only vote once per election",
            "You have the right to cast 3 ballots: National, Regional and Provincial",
            "Your personal information is protected under POPIA",
            "You have the right to a fair and free election",
          ].map((right) => (
            <div key={right} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{right}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Important Notice</p>
          <p className="text-sm text-amber-700 mt-1">
            Voting more than once, using someone else's ID, or interfering with the election process is a criminal offence punishable by law under the Electoral Act 73 of 1998.
          </p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <h2 className="font-display font-bold text-lg mb-4">Contact the IEC</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a href="tel:0800402037" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Toll Free</p>
              <p className="text-sm font-semibold">0800 40 20 37</p>
            </div>
          </a>
          <a href="https://www.elections.org.za" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Globe className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Website</p>
              <p className="text-sm font-semibold">elections.org.za</p>
            </div>
          </a>
          <a href="mailto:info@elections.org.za" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-semibold">info@elections.org.za</p>
            </div>
          </a>
        </div>
      </div>

    </div>
  );
};

export default IECPage; 