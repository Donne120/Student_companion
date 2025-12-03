import { ExternalLink, Mail, Phone, MapPin, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  url: string;
  icon?: string;
  type: 'primary' | 'secondary' | 'link';
}

interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
}

interface StructuredResponseProps {
  content: string;
  quickActions?: QuickAction[];
  resources?: Array<{ label: string; url: string }>;
  contact?: ContactInfo;
}

/**
 * StructuredResponse Component
 * Displays chatbot responses in a professional, structured format with:
 * - Quick action buttons at the top
 * - Clean content in the middle
 * - Organized resources section
 * - Contact information panel
 */
export const StructuredResponse = ({
  content,
  quickActions = [],
  resources = [],
  contact
}: StructuredResponseProps) => {
  // Parse content to extract sections
  const sections = parseStructuredContent(content);

  return (
    <div className="space-y-2 sm:space-y-4">
      {/* Quick Actions Section */}
      {quickActions.length > 0 && (
        <Card className="bg-brand-blue/30 border-brand-gold/20">
          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-brand-gold">
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Quick Actions</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.type === 'primary' ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    "text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3",
                    action.type === 'primary'
                      ? 'bg-brand-gold text-brand-blue hover:bg-brand-gold/90'
                      : 'border-brand-gold/30 text-brand-gold hover:bg-brand-gold/10'
                  )}
                  onClick={() => window.open(action.url, '_blank')}
                >
                  {action.icon && <span className="mr-1 sm:mr-2">{action.icon}</span>}
                  <span className="truncate">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Section */}
      <div className="prose prose-invert max-w-none text-sm sm:text-base">
        {sections.title && (
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-brand-gold mb-2 sm:mb-4">
            {sections.title}
          </h2>
        )}
        
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-brand-gold mb-2 sm:mb-4">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-brand-gold mb-2 sm:mb-3">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-sm sm:text-base md:text-lg font-medium text-brand-gold mb-1.5 sm:mb-2">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="text-gray-200 mb-2 sm:mb-3 leading-relaxed">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-1 sm:space-y-2 mb-2 sm:mb-4 text-gray-200">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-1 sm:space-y-2 mb-2 sm:mb-4 text-gray-200">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-gray-200">{children}</li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-brand-gold">{children}</strong>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-gold hover:underline inline-flex items-center gap-0.5 sm:gap-1"
              >
                {children}
                <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </a>
            ),
            hr: () => <Separator className="my-2 sm:my-4 bg-brand-gold/20" />,
          }}
        >
          {sections.mainContent}
        </ReactMarkdown>
      </div>

      {/* Resources Section */}
      {(resources.length > 0 || sections.resources.length > 0) && (
        <Card className="bg-brand-blue/30 border-brand-gold/20">
          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-brand-gold">
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Resources & Links</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="space-y-1.5 sm:space-y-2">
              {/* Deduplicate resources by URL */}
              {(() => {
                const allResources = [...resources, ...sections.resources];
                const seen = new Set<string>();
                const uniqueResources = allResources.filter(r => {
                  // Skip if no valid URL
                  if (!r.url || !r.url.startsWith('http')) return false;
                  // Skip duplicates
                  if (seen.has(r.url)) return false;
                  seen.add(r.url);
                  return true;
                });
                return uniqueResources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 sm:gap-2 text-gray-200 hover:text-brand-gold transition-colors group text-xs sm:text-sm"
                  >
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-brand-gold/60 group-hover:text-brand-gold flex-shrink-0" />
                    <span className="flex-1 truncate">{resource.label}</span>
                    <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </a>
                ));
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Panel */}
      {(contact || sections.contact) && (
        <Card className="bg-gradient-to-r from-brand-blue/40 to-brand-blue/20 border-brand-gold/30">
          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-brand-gold">
              <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Need Help? Contact Us</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="space-y-2 sm:space-y-3">
              {(contact?.email || sections.contact?.email) && (
                <div className="flex items-center gap-2 sm:gap-3">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-brand-gold flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] sm:text-xs text-gray-400">Email</div>
                    <a
                      href={`mailto:${contact?.email || sections.contact?.email}`}
                      className="text-xs sm:text-sm text-gray-200 hover:text-brand-gold transition-colors truncate block"
                    >
                      {contact?.email || sections.contact?.email}
                    </a>
                  </div>
                </div>
              )}
              
              {(contact?.phone || sections.contact?.phone) && (
                <div className="flex items-center gap-2 sm:gap-3">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-brand-gold flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] sm:text-xs text-gray-400">Phone</div>
                    <a
                      href={`tel:${contact?.phone || sections.contact?.phone}`}
                      className="text-xs sm:text-sm text-gray-200 hover:text-brand-gold transition-colors"
                    >
                      {contact?.phone || sections.contact?.phone}
                    </a>
                  </div>
                </div>
              )}
              
              {(contact?.location || sections.contact?.location) && (
                <div className="flex items-center gap-2 sm:gap-3">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-brand-gold flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] sm:text-xs text-gray-400">Location</div>
                    <div className="text-xs sm:text-sm text-gray-200">
                      {contact?.location || sections.contact?.location}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

/**
 * Parse structured content from markdown-formatted response
 * Extracts title, main content, resources, and contact info
 */
function parseStructuredContent(content: string) {
  const lines = content.split('\n');
  let title = '';
  let mainContent: string[] = [];
  let resources: Array<{ label: string; url: string }> = [];
  let contact: ContactInfo = {};
  
  let currentSection: 'main' | 'resources' | 'contact' = 'main';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect title (first ## heading)
    if (!title && line.startsWith('## ')) {
      title = line.replace('## ', '').trim();
      continue;
    }
    
    // Detect sections - be more specific to avoid false matches
    if (line.includes('📚 Resources') || line.match(/^\*?\*?Resources & Links/)) {
      currentSection = 'resources';
      continue;
    }
    
    // Check for Related Resources section
    if (line.includes('### Related Resources')) {
      currentSection = 'resources';
      continue;
    }
    
    // Check for contact section - be more specific
    if (line.includes('📞 Need Help') || line.match(/^\*?\*?Need Help\?/)) {
      currentSection = 'contact';
      continue;
    }
    
    // Skip horizontal rules
    if (line.trim() === '---') {
      currentSection = 'main'; // Reset to main after separator
      continue;
    }
    
    // Parse based on current section
    if (currentSection === 'main') {
      // Skip Quick Actions lines
      if (line.includes('🔗 Quick Actions') || line.includes('**Quick Actions:**')) {
        continue;
      }
      mainContent.push(line);
    } else if (currentSection === 'resources') {
      // Extract resource links - support both markdown links and plain URLs
      const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch && linkMatch[2] && linkMatch[2].startsWith('http')) {
        resources.push({
          label: linkMatch[1],
          url: linkMatch[2]
        });
      } else {
        // Check for plain URLs
        const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
          // Try to extract label from line
          const labelMatch = line.match(/\*\*([^*]+)\*\*/);
          resources.push({
            label: labelMatch ? labelMatch[1] : 'View Resource',
            url: urlMatch[1]
          });
        }
      }
    } else if (currentSection === 'contact') {
      // Extract contact info
      if (line.includes('📧') || line.toLowerCase().includes('email:') || line.toLowerCase().includes('email')) {
        const emailMatch = line.match(/[\w\.-]+@[\w\.-]+\.\w+/);
        if (emailMatch) contact.email = emailMatch[0];
      }
      if (line.includes('📱') || line.includes('📞') || line.toLowerCase().includes('phone:') || line.toLowerCase().includes('phone')) {
        const phoneMatch = line.match(/\+?\d{1,4}[\s-]?\d{2,4}[\s-]?\d{2,4}[\s-]?\d{2,4}/);
        if (phoneMatch) contact.phone = phoneMatch[0];
      }
      if (line.includes('📍') || line.toLowerCase().includes('location:')) {
        const locationMatch = line.match(/(?:Location:|📍)\s*\*?\*?(.+)/);
        if (locationMatch) contact.location = locationMatch[1].replace(/\*\*/g, '').trim();
      }
    }
  }
  
  // Clean up main content - remove empty lines at start and end
  const cleanedContent = mainContent.join('\n').trim();
  
  return {
    title,
    mainContent: cleanedContent,
    resources,
    contact: Object.keys(contact).length > 0 ? contact : null
  };
}

