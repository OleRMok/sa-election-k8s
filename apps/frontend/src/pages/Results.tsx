import ResultsPage from "./ResultsPage";
import ElectionHeader from "@/components/ElectionHeader";
import ElectionFooter from "@/components/ElectionFooter";

const Results = () => (
  <div className="flex flex-col min-h-screen bg-background">
    <ElectionHeader />
    <main className="flex-1">
      <ResultsPage />
    </main>
    <ElectionFooter />
  </div>
);

export default Results;
