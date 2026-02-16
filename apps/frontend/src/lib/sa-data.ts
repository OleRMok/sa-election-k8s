export const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
] as const;

export type Province = (typeof PROVINCES)[number];

export const MUNICIPALITIES: Record<Province, string[]> = {
  "Eastern Cape": ["Buffalo City", "Nelson Mandela Bay", "OR Tambo", "Amathole", "Chris Hani", "Joe Gqabi", "Alfred Nzo", "Sarah Baartman"],
  "Free State": ["Mangaung", "Fezile Dabi", "Lejweleputswa", "Thabo Mofutsanyana", "Xhariep"],
  "Gauteng": ["City of Johannesburg", "City of Tshwane", "Ekurhuleni", "Sedibeng", "West Rand"],
  "KwaZulu-Natal": ["eThekwini", "uMgungundlovu", "King Cetshwayo", "Zululand", "uThukela", "Amajuba", "Harry Gwala", "iLembe", "Ugu", "uMkhanyakude"],
  "Limpopo": ["Capricorn", "Mopani", "Sekhukhune", "Vhembe", "Waterberg"],
  "Mpumalanga": ["Ehlanzeni", "Gert Sibande", "Nkangala"],
  "North West": ["Bojanala Platinum", "Dr Kenneth Kaunda", "Ngaka Modiri Molema", "Dr Ruth Segomotsi Mompati"],
  "Northern Cape": ["Frances Baard", "John Taolo Gaetsewe", "Namakwa", "Pixley ka Seme", "ZF Mgcawu"],
  "Western Cape": ["City of Cape Town", "Cape Winelands", "Garden Route", "Overberg", "West Coast", "Central Karoo"],
};

export const NATIONAL_PARTIES = [
  "African National Congress (ANC)",
  "Democratic Alliance (DA)",
  "Economic Freedom Fighters (EFF)",
  "uMkhonto weSizwe (MK)",
  "ActionSA",
  "Inkatha Freedom Party (IFP)",
  "Freedom Front Plus (FF+)",
  "Patriotic Alliance (PA)",
] as const;

export const REGIONAL_PARTIES = [
  ...NATIONAL_PARTIES,
  "Independent Candidate",
] as const;

export function validateSAID(id: string): boolean {
  if (!/^\d{13}$/.test(id)) return false;
  
  const digits = id.split("").map(Number);
  // Luhn algorithm
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    let digit = digits[i];
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === digits[12];
}

export function maskSAID(id: string): string {
  if (id.length <= 6) return id;
  return id.slice(0, 6) + "*".repeat(Math.min(id.length - 6, 4)) + id.slice(10);
}
