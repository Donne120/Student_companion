import { useState } from 'react';
import { Plus, Search, Keyboard, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileActionButtonProps {
  onNewChat: () => void;
  onSearch: () => void;
  onShortcuts: () => void;
  onMenu: () => void;
}

export const MobileActionButton = ({
  onNewChat,
  onSearch,
  onShortcuts,
  onMenu,
}: MobileActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: Plus,
      label: 'New Chat',
      onClick: () => {
        onNewChat();
        setIsOpen(false);
      },
      color: 'bg-brand-gradient-gold',
    },
    {
      icon: Search,
      label: 'Search',
      onClick: () => {
        onSearch();
        setIsOpen(false);
      },
      color: 'bg-brand-blue',
    },
    {
      icon: Keyboard,
      label: 'Shortcuts',
      onClick: () => {
        onShortcuts();
        setIsOpen(false);
      },
      color: 'bg-brand-blue-light',
    },
    {
      icon: Menu,
      label: 'Menu',
      onClick: () => {
        onMenu();
        setIsOpen(false);
      },
      color: 'bg-brand-blue',
    },
  ];

  return (
    <div className="fixed bottom-20 right-4 z-50 md:hidden">
      {/* Action buttons */}
      <div
        className={cn(
          'flex flex-col gap-3 mb-3 transition-all duration-300',
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        )}
      >
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-full shadow-lg text-white',
              'transform transition-all duration-300 hover:scale-105',
              action.color,
              isOpen
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0'
            )}
            style={{
              transitionDelay: `${index * 50}ms`,
            }}
          >
            <action.icon className="w-5 h-5" />
            <span className="text-sm font-medium whitespace-nowrap">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Main FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-14 h-14 rounded-full shadow-lg flex items-center justify-center',
          'bg-brand-gradient-gold text-brand-blue-dark',
          'transform transition-all duration-300 hover:scale-110',
          'active:scale-95',
          isOpen && 'rotate-45'
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

