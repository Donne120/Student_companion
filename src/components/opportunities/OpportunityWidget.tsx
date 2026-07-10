import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Sparkles } from "lucide-react";
import { opportunitiesService, type Opportunity } from "@/services/opportunitiesService";

const ROTATE_MS = 8000;
const VISIBLE_COUNT = 3;

interface OpportunityWidgetProps {
  compact?: boolean;
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  compact: boolean;
}

const OpportunityCard = ({ opportunity, compact }: OpportunityCardProps) => (
  <a
    href={opportunity.url}
    target="_blank"
    rel="noopener noreferrer"
    className="group/card block rounded-xl border border-[#E8DDB0] bg-white p-4 hover:border-[#D4AF37] hover:shadow-sm transition-all"
  >
    <div className="flex items-center justify-between mb-2">
      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FBF7E9] border border-[#E8DDB0] text-[10px] font-medium text-[#B8941F]">
        {opportunity.category}
      </span>
      {opportunity.location && (
        <span className="text-[10px] text-[#1A1A1A]/50">{opportunity.location}</span>
      )}
    </div>
    <h3
      className={`font-semibold text-[#1A1A1A] leading-snug group-hover/card:text-[#B8941F] transition-colors ${
        compact ? "text-sm" : "text-[15px]"
      }`}
    >
      {opportunity.title}
    </h3>
    {opportunity.organization && (
      <p className="text-xs text-[#1A1A1A]/60 mt-0.5">{opportunity.organization}</p>
    )}
    <p
      className={`text-[#1A1A1A]/75 mt-2 leading-relaxed line-clamp-3 ${
        compact ? "text-xs" : "text-sm"
      }`}
    >
      {opportunity.description}
    </p>
    {opportunity.deadline && (
      <p className="mt-1.5 text-[10px] text-[#B8941F] font-medium">
        Deadline: {opportunity.deadline}
      </p>
    )}
    <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#B8941F]">
      Learn more
      <ExternalLink className="h-3 w-3" />
    </span>
  </a>
);

const SkeletonCard = () => (
  <div className="rounded-xl border border-[#E8DDB0] bg-white p-4">
    <div className="h-3 w-1/3 bg-[#FBF7E9] rounded animate-pulse mb-3" />
    <div className="space-y-2">
      <div className="h-3 w-2/3 bg-[#FBF7E9] rounded animate-pulse" />
      <div className="h-3 w-full bg-[#FBF7E9] rounded animate-pulse" />
      <div className="h-3 w-4/5 bg-[#FBF7E9] rounded animate-pulse" />
    </div>
  </div>
);

export const OpportunityWidget = ({ compact = false }: OpportunityWidgetProps) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    opportunitiesService.getOpportunities().then((list) => {
      if (!cancelled) setOpportunities(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (paused || opportunities.length <= VISIBLE_COUNT) return;
    const id = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setStartIndex((i) => (i + VISIBLE_COUNT) % opportunities.length);
        setIsFading(false);
      }, 240);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [paused, opportunities.length]);

  const advance = (direction: 1 | -1) => {
    if (opportunities.length === 0) return;
    setIsFading(true);
    setTimeout(() => {
      setStartIndex((i) => {
        const len = opportunities.length;
        return ((i + direction * VISIBLE_COUNT) % len + len) % len;
      });
      setIsFading(false);
    }, 200);
  };

  if (opportunities.length === 0) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  // Pick VISIBLE_COUNT items, wrapping around the end if needed.
  const visible: Opportunity[] = [];
  for (let i = 0; i < Math.min(VISIBLE_COUNT, opportunities.length); i++) {
    visible.push(opportunities[(startIndex + i) % opportunities.length]);
  }

  const totalPages = Math.max(1, Math.ceil(opportunities.length / VISIBLE_COUNT));
  const currentPage = Math.floor(startIndex / VISIBLE_COUNT) % totalPages;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
          <span className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/60 font-medium">
            For students
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://career.studentcompanionai.rw"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-[#B8941F] hover:underline font-medium flex items-center gap-0.5"
          >
            SCA Careers <ExternalLink className="h-2.5 w-2.5" />
          </a>
          <button
            onClick={() => advance(-1)}
            className="p-1 rounded hover:bg-[#FBF7E9] text-[#1A1A1A]/50 hover:text-[#1A1A1A] transition-colors"
            aria-label="Previous opportunities"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => advance(1)}
            className="p-1 rounded hover:bg-[#FBF7E9] text-[#1A1A1A]/50 hover:text-[#1A1A1A] transition-colors"
            aria-label="Next opportunities"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div
        className={`space-y-3 transition-opacity duration-200 ${
          isFading ? "opacity-0" : "opacity-100"
        }`}
        key={startIndex}
      >
        {visible.map((opp) => (
          <OpportunityCard key={opp.id} opportunity={opp} compact={compact} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-4">
          {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === currentPage % 5 ? "w-4 bg-[#D4AF37]" : "w-1 bg-[#E8DDB0]"
              }`}
            />
          ))}
        </div>
      )}

      <a
        href="https://career.studentcompanionai.rw"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg border border-[#E8DDB0] text-xs text-[#B8941F] font-medium hover:bg-[#FBF7E9] hover:border-[#D4AF37] transition-all"
      >
        Browse all on SCA Careers
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
};
