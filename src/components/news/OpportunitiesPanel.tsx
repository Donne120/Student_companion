import { ExternalLink, Share, ChevronLeft, ChevronRight, Pause, Play, Briefcase, DollarSign, GraduationCap, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { fetchAllOpportunities, filterOpportunitiesByType, Opportunity } from "@/services/opportunitiesService";
import { toast } from "sonner";

export const OpportunitiesPanel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'grant' | 'job' | 'internship'>('all');

  // Fetch opportunities on mount
  useEffect(() => {
    const loadOpportunities = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAllOpportunities();
        setOpportunities(data);
        setFilteredOpportunities(data);
        toast.success(`Loaded ${data.length} opportunities!`);
      } catch (error) {
        console.error('Error loading opportunities:', error);
        toast.error('Failed to load opportunities');
      } finally {
        setIsLoading(false);
      }
    };

    loadOpportunities();
  }, []);

  // Apply filter when filterType changes
  useEffect(() => {
    const filtered = filterOpportunitiesByType(opportunities, filterType);
    setFilteredOpportunities(filtered);
    setCurrentIndex(0); // Reset to first item
  }, [filterType, opportunities]);

  // Auto-scroll carousel
  useEffect(() => {
    if (isPaused || isHovered || filteredOpportunities.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredOpportunities.length);
    }, 6000); // Change slide every 6 seconds

    return () => clearInterval(interval);
  }, [isPaused, isHovered, filteredOpportunities.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredOpportunities.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredOpportunities.length) % filteredOpportunities.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'grant':
        return <DollarSign className="w-4 h-4" />;
      case 'job':
        return <Briefcase className="w-4 h-4" />;
      case 'internship':
        return <GraduationCap className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'grant':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'job':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'internship':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-brand-gold/10 text-brand-gold border-brand-gold/20';
    }
  };

  if (isLoading) {
    return (
      <div className="h-full overflow-hidden flex flex-col bg-brand-gradient border-l border-brand-gold/20 shadow-xl">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold mx-auto mb-4"></div>
            <p className="text-white">Loading opportunities...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden flex flex-col bg-brand-gradient border-l border-brand-gold/20 shadow-xl">
      {/* Header with Logo and Title */}
      <div className="p-6 pb-4 backdrop-blur-sm bg-brand-blue-dark/80 border-b border-brand-gold/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="Student Companion" 
              className="h-8 w-auto object-contain"
            />
            <h2 className="text-2xl font-bold text-white">
              Opportunities
            </h2>
          </div>
          
          {/* Carousel Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevious}
              className="p-1.5 rounded-full hover:bg-brand-blue transition-colors"
              aria-label="Previous opportunity"
            >
              <ChevronLeft className="w-5 h-5 text-brand-gold" />
            </button>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 rounded-full hover:bg-brand-blue transition-colors"
              aria-label={isPaused ? "Play" : "Pause"}
            >
              {isPaused ? (
                <Play className="w-4 h-4 text-brand-gold" />
              ) : (
                <Pause className="w-4 h-4 text-brand-gold" />
              )}
            </button>
            <button
              onClick={goToNext}
              className="p-1.5 rounded-full hover:bg-brand-blue transition-colors"
              aria-label="Next opportunity"
            >
              <ChevronRight className="w-5 h-5 text-brand-gold" />
            </button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-3 flex-wrap">
          <Button
            size="sm"
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
            className="text-xs"
          >
            <Filter className="w-3 h-3 mr-1" />
            All ({opportunities.length})
          </Button>
          <Button
            size="sm"
            variant={filterType === 'grant' ? 'default' : 'outline'}
            onClick={() => setFilterType('grant')}
            className="text-xs"
          >
            <DollarSign className="w-3 h-3 mr-1" />
            Grants
          </Button>
          <Button
            size="sm"
            variant={filterType === 'job' ? 'default' : 'outline'}
            onClick={() => setFilterType('job')}
            className="text-xs"
          >
            <Briefcase className="w-3 h-3 mr-1" />
            Jobs
          </Button>
          <Button
            size="sm"
            variant={filterType === 'internship' ? 'default' : 'outline'}
            onClick={() => setFilterType('internship')}
            className="text-xs"
          >
            <GraduationCap className="w-3 h-3 mr-1" />
            Internships
          </Button>
        </div>
        
        {/* Progress Indicators */}
        <div className="flex gap-1.5">
          {filteredOpportunities.slice(0, 10).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-brand-gold flex-1' 
                  : 'bg-brand-gold/30 w-8'
              }`}
              aria-label={`Go to opportunity ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Carousel Content */}
      <div 
        className="flex-grow overflow-hidden relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="h-full p-6 pt-4">
          {filteredOpportunities.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">No opportunities found for this filter.</p>
            </div>
          ) : (
            filteredOpportunities.map((item, index) => (
              <div
                key={item.id}
                className={`absolute inset-0 p-6 pt-4 transition-all duration-700 ${
                  index === currentIndex
                    ? 'opacity-100 translate-x-0'
                    : index < currentIndex
                    ? 'opacity-0 -translate-x-full'
                    : 'opacity-0 translate-x-full'
                }`}
              >
                <div className="relative rounded-xl bg-brand-blue-dark/40 border border-brand-gold/10 overflow-hidden shadow-lg transition-all group hover:shadow-brand-gold/20 h-full flex flex-col">
                  {/* Image */}
                  {item.image && (
                    <div className="w-full h-48 overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`${getTypeColor(item.type)} hover:opacity-80 flex items-center gap-1`}
                        >
                          {getTypeIcon(item.type)}
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </Badge>
                        <Badge variant="outline" className="bg-brand-gold/10 text-brand-gold border-brand-gold/20">
                          {item.category}
                        </Badge>
                      </div>
                      <span className="text-xs font-medium text-gray-400">
                        {new Date(item.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group flex-1 flex flex-col"
                    >
                      <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-brand-gold transition-colors flex items-center gap-2">
                        {item.title}
                        <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      
                      <p className="text-gray-300 text-sm line-clamp-3 mb-3 flex-1">
                        {item.description}
                      </p>

                      {/* Additional Info */}
                      <div className="space-y-2 mb-3">
                        {item.company && (
                          <p className="text-xs text-gray-400">
                            <span className="font-medium text-brand-gold">Company:</span> {item.company}
                          </p>
                        )}
                        {item.location && (
                          <p className="text-xs text-gray-400">
                            <span className="font-medium text-brand-gold">Location:</span> {item.location}
                          </p>
                        )}
                        {item.salary && (
                          <p className="text-xs text-gray-400">
                            <span className="font-medium text-brand-gold">Compensation:</span> {item.salary}
                          </p>
                        )}
                        {item.deadline && (
                          <p className="text-xs text-red-400">
                            <span className="font-medium">Deadline:</span> {new Date(item.deadline).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        )}
                      </div>

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.tags.slice(0, 4).map((tag, i) => (
                            <span 
                              key={i} 
                              className="text-xs px-2 py-0.5 rounded-full bg-brand-blue/30 text-gray-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-brand-gold/10">
                        <span className="text-xs text-brand-gold font-medium">Apply now →</span>
                        <div className="flex space-x-2">
                          <button 
                            className="p-1.5 rounded-full hover:bg-brand-gold/10 transition-colors" 
                            title="Share"
                            onClick={(e) => {
                              e.preventDefault();
                              navigator.clipboard.writeText(item.url);
                              toast.success('Link copied to clipboard!');
                            }}
                          >
                            <Share className="w-4 h-4 text-gray-400 hover:text-brand-gold" />
                          </button>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto p-5 bg-brand-gradient-blue-gold backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-300">
              {filteredOpportunities.length} opportunities available • Updated daily
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

