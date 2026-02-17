import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const PARTY_CHART_COLORS: Record<string, string> = {
  "African National Congress (ANC)": "#15803d",
  "Democratic Alliance (DA)": "#2563eb",
  "Economic Freedom Fighters (EFF)": "#dc2626",
  "uMkhonto weSizwe (MK)": "#92400e",
  "ActionSA": "#7c3aed",
  "Inkatha Freedom Party (IFP)": "#991b1b",
  "Freedom Front Plus (FF+)": "#ea580c",
  "Patriotic Alliance (PA)": "#0f766e",
};

interface ResultEntry {
  party: string;
  votes: number;
}

const fetchResults = async (): Promise<ResultEntry[]> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/results`);
  if (!res.ok) throw new Error("Failed to fetch results");
  const data = await res.json();

  // Normalize: expect { national_tally: { partyName: count } } or array
  if (data.national_tally && typeof data.national_tally === "object") {
    return Object.entries(data.national_tally).map(([party, votes]) => ({
      party,
      votes: votes as number,
    }));
  }
  if (Array.isArray(data)) return data;
  return [];
};

const ResultsPage = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["election-results"],
    queryFn: fetchResults,
    refetchInterval: 15000,
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Live Results</h1>
          <p className="text-muted-foreground text-sm">National Assembly — Party Vote Tallies</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      <div className="bg-card rounded-lg border shadow-sm p-6">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p>Loading results…</p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <AlertTriangle className="w-8 h-8 mb-3 text-accent" />
            <p className="font-medium">Unable to load results</p>
            <p className="text-sm mt-1">Ensure the results server is running at localhost:8000</p>
          </div>
        )}

        {data && data.length > 0 && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} layout="vertical" margin={{ left: 160, right: 30, top: 10, bottom: 10 }}>
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="party"
                tick={{ fontSize: 12 }}
                width={150}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0 0% 100%)",
                  border: "1px solid hsl(220 15% 88%)",
                  borderRadius: "6px",
                  fontSize: "13px",
                }}
              />
              <Bar dataKey="votes" radius={[0, 4, 4, 0]} barSize={28}>
                {data.map((entry) => (
                  <Cell
                    key={entry.party}
                    fill={PARTY_CHART_COLORS[entry.party] || "#64748b"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {data && data.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="font-medium">No votes recorded yet</p>
            <p className="text-sm mt-1">Results will appear here once voting begins.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
