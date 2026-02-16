import LineHeader from "@/components/LineHeader";
import LineSidebar from "@/components/LineSidebar";
import KeywordTable from "@/components/KeywordTable";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LineHeader />
      <div className="flex flex-1">
        <LineSidebar />
        <KeywordTable />
      </div>
    </div>
  );
};

export default Index;
