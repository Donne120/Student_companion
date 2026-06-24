
import { ExternalLink, Share } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NewsItem {
  title: string;
  date: string;
  category: string;
  description: string;
  url: string;
  image: string;
}

export const NewsUpdate = () => {
  // This would typically come from an API, but for now we'll use static data with real images
  const news: NewsItem[] = [
    {
      title: "New Leadership Program Launch",
      date: "2024-02-20",
      category: "Academic",
      description: "ALU introduces an innovative leadership development program focused on African entrepreneurship.",
      url: "https://www.alueducation.com/news/leadership-program-2024",
      image: "/news-leadership.png"
    },
    {
      title: "Campus Sustainability Initiative",
      date: "2024-02-19",
      category: "Campus",
      description: "ALU commits to 100% renewable energy usage by 2025 across all campuses.",
      url: "https://www.alueducation.com/news/sustainability-2025",
      image: "/news-sustainability.png"
    },
    {
      title: "Tech Innovation Challenge",
      date: "2024-02-18",
      category: "Events",
      description: "Join the upcoming pan-African tech innovation challenge with prizes worth $10,000.",
      url: "https://www.alueducation.com/events/tech-challenge",
      image: "/news-tech.png"
    }
  ];

  return (
    <div className="flex flex-col bg-white">
      <div className="hidden md:block p-6 pb-4 bg-white border-b border-[#E8DDB0]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#D4AF37] rounded-sm flex items-center justify-center text-[#1A1A1A] font-bold text-xs">
            ALU
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A1A]">ALU News</h2>
        </div>
      </div>

      <div className="p-4 md:p-6 md:pt-4 space-y-4 md:space-y-5">
        {news.map((item, index) => (
          <div
            key={index}
            className="relative rounded-xl bg-white border border-[#E8DDB0] overflow-hidden shadow-sm transition-all group hover:shadow-md hover:border-[#D4AF37]/50"
          >
            <div className="w-full h-40 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <Badge
                  variant="outline"
                  className="bg-[#FBF7E9] text-[#B8941F] border-[#E8DDB0]"
                >
                  {item.category}
                </Badge>
                <span className="text-xs font-medium text-[#1A1A1A]/60">
                  {new Date(item.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <h3 className="font-semibold text-[#1A1A1A] text-lg mb-2 group-hover:text-[#B8941F] transition-colors flex items-center gap-2">
                  {item.title}
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-[#1A1A1A]/70 line-clamp-2 mb-4">{item.description}</p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E8DDB0]">
                  <span className="text-xs text-[#B8941F] font-medium">Read more</span>
                  <button
                    className="p-1.5 rounded-full hover:bg-[#FBF7E9] transition-colors"
                    title="Share"
                  >
                    <Share className="w-4 h-4 text-[#1A1A1A]/60 hover:text-[#D4AF37]" />
                  </button>
                </div>
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto p-5 bg-[#FBF7E9] border-t border-[#E8DDB0]">
        <p className="text-xs text-[#1A1A1A]/70">
          Subscribe for real-time ALU news from our campuses worldwide.
        </p>
      </div>
    </div>
  );
};
