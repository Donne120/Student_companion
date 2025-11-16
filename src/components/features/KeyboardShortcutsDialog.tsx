import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';
import { getModifierKey } from '@/hooks/useKeyboardShortcuts';

interface ShortcutGroup {
  title: string;
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const KeyboardShortcutsDialog = ({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) => {
  const modKey = getModifierKey();

  const shortcutGroups: ShortcutGroup[] = [
    {
      title: 'General',
      shortcuts: [
        { keys: [modKey, 'K'], description: 'Open search' },
        { keys: [modKey, 'N'], description: 'New conversation' },
        { keys: [modKey, '/'], description: 'Show keyboard shortcuts' },
        { keys: ['Esc'], description: 'Close dialogs' },
      ],
    },
    {
      title: 'Navigation',
      shortcuts: [
        { keys: [modKey, 'B'], description: 'Toggle sidebar' },
        { keys: ['↑', '↓'], description: 'Navigate search results' },
        { keys: ['Enter'], description: 'Select item' },
      ],
    },
    {
      title: 'Chat',
      shortcuts: [
        { keys: ['Enter'], description: 'Send message' },
        { keys: ['Shift', 'Enter'], description: 'New line' },
        { keys: [modKey, 'L'], description: 'Clear chat' },
        { keys: ['/'], description: 'Focus input' },
      ],
    },
    {
      title: 'Editing',
      shortcuts: [
        { keys: [modKey, 'C'], description: 'Copy message' },
        { keys: [modKey, 'E'], description: 'Edit message' },
        { keys: [modKey, 'Z'], description: 'Undo' },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-brand-blue-dark border-brand-gold/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Keyboard className="w-5 h-5 text-brand-gold" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-brand-gold mb-3">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-300">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center">
                          <kbd className="px-2 py-1 bg-brand-blue rounded border border-brand-gold/20 text-white text-xs font-mono">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="mx-1 text-gray-500">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-brand-blue/50 rounded-lg border border-brand-gold/20">
          <p className="text-sm text-gray-300">
            <span className="text-brand-gold font-semibold">Tip:</span> Press{' '}
            <kbd className="px-2 py-1 bg-brand-blue-dark rounded border border-brand-gold/20 text-white text-xs font-mono">
              {modKey}
            </kbd>
            {' + '}
            <kbd className="px-2 py-1 bg-brand-blue-dark rounded border border-brand-gold/20 text-white text-xs font-mono">
              /
            </kbd>{' '}
            anytime to view this help dialog.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

