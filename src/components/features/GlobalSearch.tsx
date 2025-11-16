import { useState, useEffect, useRef } from 'react';
import { Search, MessageSquare, FileText, Clock, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Conversation } from '@/types/chat';

interface SearchResult {
  id: string;
  type: 'conversation' | 'message' | 'document';
  title: string;
  preview?: string;
  timestamp?: number;
  conversationId?: string;
}

interface GlobalSearchProps {
  conversations: Conversation[];
  onSelect: (result: SearchResult) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GlobalSearch = ({
  conversations,
  onSelect,
  open,
  onOpenChange,
}: GlobalSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Search through conversations and messages
  useEffect(() => {
    if (!query.trim()) {
      // Show recent conversations when no query
      const recentResults: SearchResult[] = conversations
        .slice(0, 5)
        .map(conv => ({
          id: conv.id,
          type: 'conversation' as const,
          title: conv.title || 'New Chat',
          preview: conv.messages[conv.messages.length - 1]?.text.slice(0, 100),
          timestamp: conv.updatedAt,
        }));
      setResults(recentResults);
      return;
    }

    const searchQuery = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search conversations
    conversations.forEach(conv => {
      const titleMatch = conv.title?.toLowerCase().includes(searchQuery);
      
      if (titleMatch) {
        searchResults.push({
          id: conv.id,
          type: 'conversation',
          title: conv.title || 'New Chat',
          preview: conv.messages[conv.messages.length - 1]?.text.slice(0, 100),
          timestamp: conv.updatedAt,
        });
      }

      // Search messages within conversations
      conv.messages.forEach((message, index) => {
        if (message.text.toLowerCase().includes(searchQuery)) {
          searchResults.push({
            id: `${conv.id}-${index}`,
            type: 'message',
            title: message.text.slice(0, 60) + (message.text.length > 60 ? '...' : ''),
            preview: message.text.slice(0, 150),
            timestamp: message.timestamp,
            conversationId: conv.id,
          });
        }
      });
    });

    // Sort by relevance and recency
    searchResults.sort((a, b) => {
      // Prioritize exact matches
      const aExact = a.title.toLowerCase() === searchQuery;
      const bExact = b.title.toLowerCase() === searchQuery;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // Then by timestamp
      return (b.timestamp || 0) - (a.timestamp || 0);
    });

    setResults(searchResults.slice(0, 10)); // Limit to 10 results
    setSelectedIndex(0);
  }, [query, conversations]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onOpenChange(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    onSelect(result);
    onOpenChange(false);
    setQuery('');
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'conversation':
        return <MessageSquare className="w-4 h-4" />;
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-brand-blue-dark border-brand-gold/20">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-brand-gold/20">
          <Search className="w-5 h-5 text-brand-gold" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search conversations and messages..."
            className="border-0 bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              {query ? (
                <>
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No results found for "{query}"</p>
                </>
              ) : (
                <>
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Start typing to search...</p>
                </>
              )}
            </div>
          ) : (
            <div className="p-2">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3',
                    index === selectedIndex
                      ? 'bg-brand-blue border border-brand-gold/30'
                      : 'hover:bg-brand-blue/50 border border-transparent'
                  )}
                >
                  <div className="mt-1 text-brand-gold">{getIcon(result.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-medium text-white truncate">
                        {result.title}
                      </h3>
                      {result.timestamp && (
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatTimestamp(result.timestamp)}
                        </span>
                      )}
                    </div>
                    {result.preview && (
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {result.preview}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-brand-gold capitalize">
                        {result.type}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer with keyboard hints */}
        <div className="flex items-center justify-between p-3 border-t border-brand-gold/20 bg-brand-blue-dark/50 text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-brand-blue rounded border border-brand-gold/20">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-brand-blue rounded border border-brand-gold/20">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-brand-blue rounded border border-brand-gold/20">Esc</kbd>
              Close
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
