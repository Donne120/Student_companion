import { MobileTopBar } from "@/components/mobile/MobileTopBar";
import { NewsUpdate } from "@/components/news/NewsUpdate";

export default function News() {
  return (
    <div className="min-h-screen bg-white pb-safe-tabbar md:pb-0">
      <MobileTopBar title="ALU News" subtitle="Latest updates from campus" />
      <div className="max-w-3xl mx-auto">
        <NewsUpdate />
      </div>
    </div>
  );
}
