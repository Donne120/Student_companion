import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean; // Command key on Mac
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
}

export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) => {
  const { enabled = true } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when user is typing in an input/textarea
      const target = event.target as HTMLElement;
      const isInput = ['INPUT', 'TEXTAREA'].includes(target.tagName);
      const isContentEditable = target.contentEditable === 'true';

      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;
        const metaMatches = shortcut.meta ? event.metaKey : true;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
          // Allow some shortcuts even in inputs (like Cmd+K for search)
          const allowInInput = shortcut.key === 'k' && (event.ctrlKey || event.metaKey);
          
          if (!isInput && !isContentEditable || allowInInput) {
            if (shortcut.preventDefault !== false) {
              event.preventDefault();
            }
            shortcut.action();
            break;
          }
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);

  return shortcuts;
};

// Helper function to get the modifier key symbol based on OS
export const getModifierKey = () => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  return isMac ? '⌘' : 'Ctrl';
};

// Helper function to format shortcut for display
export const formatShortcut = (shortcut: KeyboardShortcut) => {
  const parts: string[] = [];
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  if (shortcut.ctrl || shortcut.meta) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.shift) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }
  parts.push(shortcut.key.toUpperCase());

  return parts.join(isMac ? '' : '+');
};

