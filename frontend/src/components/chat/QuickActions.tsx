import { ExternalLink, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickAction {
  label: string;
  url: string;
  icon?: string;
  type?: 'primary' | 'secondary' | 'link';
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export const QuickActions = ({ actions }: QuickActionsProps) => {
  if (!actions || actions.length === 0) return null;

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case '🔗':
        return <ExternalLink className="w-4 h-4" />;
      case '📄':
        return <FileText className="w-4 h-4" />;
      case '📥':
        return <Download className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  const getPrimaryAction = () => actions.find(a => a.type === 'primary') || actions[0];
  const getSecondaryActions = () => actions.filter(a => a.type !== 'primary').slice(0, 2);

  const primaryAction = getPrimaryAction();
  const secondaryActions = getSecondaryActions();

  return (
    <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-brand-gold/20">
      {/* Primary Action */}
      {primaryAction && (
        <Button
          variant="default"
          size="sm"
          className="bg-brand-gold text-brand-blue hover:bg-brand-gold/90 font-semibold"
          onClick={() => window.open(primaryAction.url, '_blank')}
        >
          {getIcon(primaryAction.icon)}
          <span className="ml-2">{primaryAction.label}</span>
        </Button>
      )}

      {/* Secondary Actions */}
      {secondaryActions.map((action, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
          onClick={() => window.open(action.url, '_blank')}
        >
          {getIcon(action.icon)}
          <span className="ml-2">{action.label}</span>
        </Button>
      ))}
    </div>
  );
};

