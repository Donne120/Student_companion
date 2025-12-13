import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Calendar, MapPin, DollarSign, Briefcase, GraduationCap, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchOpportunities, Opportunity } from '@/services/opportunitiesService';

export function OpportunitiesPanel() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<'all' | 'grant' | 'job' | 'internship'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOpportunities = async () => {
      setIsLoading(true);
      try {
        const data = await fetchOpportunities();
        setOpportunities(data);
      } catch (error) {
        console.error('Failed to load opportunities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOpportunities();
  }, []);

  // Auto-rotate every 8 seconds
  useEffect(() => {
    const filtered = filteredOpportunities;
    if (filtered.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % filtered.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [opportunities, filter]);

  const filteredOpportunities = filter === 'all' 
    ? opportunities 
    : opportunities.filter(opp => opp.type === filter);

  const currentOpportunity = filteredOpportunities[currentIndex];

  const goNext = () => {
    setCurrentIndex(prev => (prev + 1) % filteredOpportunities.length);
  };

  const goPrev = () => {
    setCurrentIndex(prev => (prev - 1 + filteredOpportunities.length) % filteredOpportunities.length);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'grant': return <Gift className="w-4 h-4" />;
      case 'job': return <Briefcase className="w-4 h-4" />;
      case 'internship': return <GraduationCap className="w-4 h-4" />;
      default: return <Briefcase className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'grant': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'job': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'internship': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="h-3 bg-white/10 rounded w-full"></div>
          <div className="h-3 bg-white/10 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (filteredOpportunities.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <p className="text-gray-400 text-sm text-center">No opportunities available</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
      {/* Header with filters */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-semibold text-sm">🎯 Opportunities</h3>
          <span className="text-xs text-gray-400">
            {currentIndex + 1}/{filteredOpportunities.length}
          </span>
        </div>
        
        {/* Filter buttons */}
        <div className="flex gap-1 flex-wrap">
          {(['all', 'grant', 'job', 'internship'] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                setFilter(type);
                setCurrentIndex(0);
              }}
              className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                filter === type
                  ? 'bg-brand-gold text-black font-medium'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
            </button>
          ))}
        </div>
      </div>

      {/* Current opportunity card */}
      {currentOpportunity && (
        <div className="p-4">
          {/* Type badge */}
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border mb-2 ${getTypeColor(currentOpportunity.type)}`}>
            {getTypeIcon(currentOpportunity.type)}
            <span className="capitalize">{currentOpportunity.type}</span>
          </div>

          {/* Title */}
          <h4 className="text-white font-medium text-sm mb-1 line-clamp-2">
            {currentOpportunity.title}
          </h4>

          {/* Organization */}
          <p className="text-brand-gold text-xs mb-2">
            {currentOpportunity.organization}
          </p>

          {/* Details */}
          <div className="space-y-1 mb-3">
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <MapPin className="w-3 h-3" />
              <span>{currentOpportunity.location}</span>
            </div>
            
            {currentOpportunity.salary && (
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <DollarSign className="w-3 h-3" />
                <span>{currentOpportunity.salary}</span>
              </div>
            )}
            
            {currentOpportunity.deadline && (
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <Calendar className="w-3 h-3" />
                <span>Deadline: {new Date(currentOpportunity.deadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-400 text-xs line-clamp-2 mb-3">
            {currentOpportunity.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {currentOpportunity.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-white/5 text-gray-400 text-xs rounded">
                #{tag}
              </span>
            ))}
          </div>

          {/* Apply button */}
          <a
            href={currentOpportunity.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 bg-brand-gold hover:bg-brand-gold-dark text-black text-xs font-medium rounded-lg transition-colors"
          >
            <span>Apply Now</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Navigation */}
      {filteredOpportunities.length > 1 && (
        <div className="flex items-center justify-between px-4 pb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={goPrev}
            className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          {/* Dots indicator */}
          <div className="flex gap-1">
            {filteredOpportunities.slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  idx === currentIndex ? 'bg-brand-gold' : 'bg-white/20'
                }`}
              />
            ))}
            {filteredOpportunities.length > 5 && (
              <span className="text-xs text-gray-500">...</span>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={goNext}
            className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-white/10"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default OpportunitiesPanel;

