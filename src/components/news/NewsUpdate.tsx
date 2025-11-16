
import { ExternalLink, Share, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";

interface NewsItem {
  title: string;
  date: string;
  category: string;
  description: string;
  url: string;
  image: string;
}

export const NewsUpdate = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // This would typically come from an API, but for now we'll use static data with real images
  const news: NewsItem[] = [
    {
      title: "New Leadership Program Launch",
      date: "2024-02-20",
      category: "Academic",
      description: "ALU introduces an innovative leadership development program focused on African entrepreneurship.",
      url: "https://www.alueducation.com/news/leadership-program-2024",
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
    },
    {
      title: "Campus Sustainability Initiative",
      date: "2024-02-19",
      category: "Campus",
      description: "ALU commits to 100% renewable energy usage by 2025 across all campuses.",
      url: "https://www.alueducation.com/news/sustainability-2025",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
    },
    {
      title: "Tech Innovation Challenge",
      date: "2024-02-18",
      category: "Events",
      description: "Join the upcoming pan-African tech innovation challenge with prizes worth $10,000.",
      url: "https://www.alueducation.com/events/tech-challenge",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
    },
    {
      title: "Student Scholarship Opportunities",
      date: "2024-02-17",
      category: "Opportunities",
      description: "New scholarship programs available for outstanding students. Apply now for financial support.",
      url: "https://www.alueducation.com/scholarships",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
    },
    {
      title: "Career Fair 2024",
      date: "2024-02-16",
      category: "Events",
      description: "Connect with top employers at our annual career fair. Register today to secure your spot.",
      url: "https://www.alueducation.com/events/career-fair",
      image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
    },
    {
      title: "Research Grant Applications Open",
      date: "2024-02-15",
      category: "Academic",
      description: "Apply for research grants to fund your innovative projects. Deadline: March 31st.",
      url: "https://www.alueducation.com/research/grants",
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
    }
  ];

  // Auto-scroll functionality
  useEffect(() => {
    if (isPaused || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % news.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isPaused, isHovered, news.length]);

  // Smooth scroll to current index
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardHeight = container.scrollHeight / news.length;
      container.scrollTo({
        top: currentIndex * cardHeight,
        behavior: 'smooth'
      });
    }
  }, [currentIndex, news.length]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % news.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + news.length) % news.length);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <div className="h-full overflow-hidden flex flex-col bg-brand-gradient border-l border-brand-gold/20 shadow-xl">
      {/* Header with ALU branding and controls */}
      <div className="p-6 pb-4 backdrop-blur-sm bg-brand-blue-dark/80 border-b border-brand-gold/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="Student Companion" 
              className="h-8 w-auto object-contain"
            />
            <h2 className="text-2xl font-bold text-white">
              Campus News
            </h2>
          </div>
          
          {/* Carousel Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePause}
              className="p-2 rounded-full hover:bg-brand-gold/10 transition-colors text-brand-gold"
              title={isPaused ? "Resume auto-scroll" : "Pause auto-scroll"}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              onClick={goToPrevious}
              className="p-2 rounded-full hover:bg-brand-gold/10 transition-colors text-brand-gold"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToNext}
              className="p-2 rounded-full hover:bg-brand-gold/10 transition-colors text-brand-gold"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="flex gap-1 mt-4">
          {news.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-brand-gold'
                  : 'bg-brand-gold/20 hover:bg-brand-gold/40'
              }`}
              title={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Auto-scrolling news content */}
      <div 
        className="flex-grow overflow-hidden relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="h-full p-6 pt-4">
          {news.map((item, index) => (
            <div
              key={index}
              className={`absolute inset-0 p-6 pt-4 transition-all duration-700 ${
                index === currentIndex
                  ? 'opacity-100 translate-x-0'
                  : index < currentIndex
                  ? 'opacity-0 -translate-x-full'
                  : 'opacity-0 translate-x-full'
              }`}
            >
              <div className="relative rounded-xl bg-brand-blue-dark/40 border border-brand-gold/10 overflow-hidden shadow-lg transition-all group hover:shadow-brand-gold/20 h-full flex flex-col">
                {/* Image at the top of the card */}
                <div className="w-full h-48 overflow-hidden flex-shrink-0">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="bg-brand-gold/10 text-brand-gold border-brand-gold/20 hover:border-brand-gold/30 hover:bg-brand-gold/15">
                      {item.category}
                    </Badge>
                    <span className="text-xs font-medium text-gray-400">
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group flex-1 flex flex-col"
                  >
                    <h3 className="font-semibold text-white text-xl mb-3 group-hover:text-brand-gold transition-colors flex items-center gap-2">
                      {item.title}
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </h3>
                    <p className="text-gray-300 mb-4 flex-1">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-brand-gold/10">
                      <span className="text-sm text-brand-gold font-medium">Read more →</span>
                      <div className="flex space-x-2">
                        <button 
                          className="p-2 rounded-full hover:bg-brand-gold/10 transition-colors" 
                          title="Share"
                          onClick={(e) => e.preventDefault()}
                        >
                          <Share className="w-4 h-4 text-gray-400 hover:text-brand-gold" />
                        </button>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer with subscription hint */}
      <div className="mt-auto p-5 bg-brand-gradient-blue-gold backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-300">
              Stay updated with the latest news from ALU campuses worldwide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
