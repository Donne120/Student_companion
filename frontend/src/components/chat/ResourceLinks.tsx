import { ExternalLink, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ResourceLink {
  label: string;
  url: string;
  type?: 'primary' | 'secondary' | 'link';
}

interface ResourceLinksProps {
  resources: ResourceLink[];
}

export const ResourceLinks = ({ resources }: ResourceLinksProps) => {
  if (!resources || resources.length === 0) return null;

  return (
    <Card className="mt-4 p-4 bg-brand-blue/20 border-brand-gold/20">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-brand-gold" />
        <h4 className="font-semibold text-brand-gold">Resources & Links</h4>
      </div>
      
      <ul className="space-y-2">
        {resources.map((resource, index) => (
          <li key={index} className="flex items-start gap-2">
            <ExternalLink className="w-3 h-3 text-brand-gold mt-1 flex-shrink-0" />
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand-gold hover:underline"
            >
              {resource.type === 'primary' && <strong>Main Portal: </strong>}
              {resource.type === 'secondary' && <strong>Documentation: </strong>}
              {resource.label}
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );
};

