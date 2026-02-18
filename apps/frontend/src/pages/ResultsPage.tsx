import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface AllElectionResults {
  national: ResultEntry[];
  provincial: Record<string, ResultEntry[]>;
  regional: Record<string, ResultEntry[]>;
}

const fetchResults = async (): Promise<AllElectionResults> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/results`);
  if (!res.ok) throw new Error("Failed to fetch results");
  const data = await res.json();

  const transformTally = (tally: Record<string, number>) => 
    Object.entries(tally).map(([party, votes]) => ({ party, votes: Number(votes) }));

  return {
    national: transformTally(data.national_tally || {}),
    provincial: Object.fromEntries(
      Object.entries(data.provincial_tally || {}).map(([prov, tally]) => [prov, transformTally(tally as any)])
    ),
    regional: Object.fromEntries(
      Object.entries(data.regional_tally || {}).map(([prov, tally]) => [prov, transformTally(tally as any)])
    ),
  };
};

const ResultsPage = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["election-results"],
    queryFn: fetchResults,
    refetchInterval: 15000,
  });

  const renderChart = (chartData: ResultEntry[]) => (
    <div className="h-[400px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 140, right: 30, top: 10, bottom: 10 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="party" width={130} tick={{ fontSize: 11 }} />
          <Tooltip cursor={{ fill: 'transparent' }} />
          <Bar dataKey="votes" radius={[0, 4, 4, 0]} barSize={24}>
            {chartData.map((entry) => (
              <Cell key={entry.party} fill={PARTY_CHART_COLORS[entry.party] || "#64748b"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Live Election Tally</h1>
          <p className="text-muted-foreground text-sm italic">Real-time data from RSA Electoral Commission</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} className="w-fit gap-2 border-gold text-navy hover:bg-gold/10">
          <RefreshCw className="w-4 h-4" /> Update Results
        </Button>
      </div>

      <Tabs defaultValue="national" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-navy/5 p-1 rounded-xl">
          <TabsTrigger value="national">National</TabsTrigger>
          <TabsTrigger value="provincial">Provincial</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
        </TabsList>

        <div className="mt-6 bg-card rounded-xl border-2 border-navy/5 shadow-xl p-6 min-h-[500px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[400px]"><Loader2 className="animate-spin text-gold" /></div>
          ) : isError ? (
            <div className="text-center py-20"><AlertTriangle className="mx-auto text-destructive mb-2" /><p>Connection Error</p></div>
          ) : (
            <>
              <TabsContent value="national">
                <h3 className="text-xl font-bold text-navy border-b pb-2 mb-4">National Results</h3>
                {data?.national.length ? renderChart(data.national) : <NoVotes />}
              </TabsContent>

              <TabsContent value="provincial">
                <h3 className="text-xl font-bold text-navy border-b pb-2 mb-4">Provincial Ballots</h3>
                {Object.keys(data?.provincial || {}).map(prov => (
                  <div key={prov} className="mb-8">
                    <h4 className="font-bold text-gold mb-2">{prov}</h4>
                    {renderChart(data!.provincial[prov])}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="regional">
                 <h3 className="text-xl font-bold text-navy border-b pb-2 mb-4">Regional Ballots</h3>
                 {Object.keys(data?.regional || {}).map(prov => (
                  <div key={prov} className="mb-8">
                    <h4 className="font-bold text-gold mb-2">{prov}</h4>
                    {renderChart(data!.regional[prov])}
                  </div>
                ))}
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
};

const NoVotes = () => (
  <div className="text-center py-20 text-muted-foreground">
    <p className="font-medium">No ballots cast in this category.</p>
  </div>
);

export default ResultsPage;
