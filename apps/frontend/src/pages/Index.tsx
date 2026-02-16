import VotePage from "./VotePage";
import ElectionHeader from "@/components/ElectionHeader";
import ElectionFooter from "@/components/ElectionFooter";

const Index = () => (
  <div className="flex flex-col min-h-screen bg-background">
    <ElectionHeader />
    <main className="flex-1">
      <VotePage />
    </main>
    <ElectionFooter />
  </div>
);

export default Index;
