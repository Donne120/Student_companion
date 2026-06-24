import { MobileTopBar } from "@/components/mobile/MobileTopBar";
import { OpportunityWidget } from "@/components/opportunities/OpportunityWidget";

export default function Opportunities() {
  return (
    <div className="min-h-screen bg-white pb-safe-tabbar md:pb-0">
      <MobileTopBar title="Discover" subtitle="Scholarships, internships, events" />
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        <OpportunityWidget />
      </div>
    </div>
  );
}
