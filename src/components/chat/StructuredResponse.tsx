import { ExternalLink, Mail, Phone, MapPin, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
    <div className="space-y-4">
      {/* Quick Actions Section */}
      {quickActions.length > 0 && (
        <Card className="bg-brand-blue/30 border-brand-gold/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-sm font-medium text-brand-gold">
              <ExternalLink className="w-4 h-4" />
              <span>Quick Actions</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.type === 'primary' ? 'default' : 'outline'}
                  size="sm"
                  className={
                    action.type === 'primary'
                      ? 'bg-brand-gold text-brand-blue hover:bg-brand-gold/90'
                      : 'border-brand-gold/30 text-brand-gold hover:bg-brand-gold/10'
                  }
                  onClick={() => window.open(action.url, '_blank')}
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Section */}
      <div className="prose prose-invert max-w-none">
        {sections.title && (
          <h2 className="text-2xl font-bold text-brand-gold mb-4">
            {sections.title}
          </h2>
        )}
        
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold text-brand-gold mb-4">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold text-brand-gold mb-3">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-medium text-brand-gold mb-2">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="text-gray-200 mb-3 leading-relaxed">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-2 mb-4 text-gray-200">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-200">
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
                className="text-brand-gold hover:underline inline-flex items-center gap-1"
              >
                {children}
                <ExternalLink className="w-3 h-3" />
              </a>
            ),
            hr: () => <Separator className="my-4 bg-brand-gold/20" />,
          }}
        >
          {sections.mainContent}
        </ReactMarkdown>
      </div>

      {/* Resources Section */}
      {(resources.length > 0 || sections.resources.length > 0) && (
        <Card className="bg-brand-blue/30 border-brand-gold/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-sm font-medium text-brand-gold">
              <BookOpen className="w-4 h-4" />
              <span>Resources & Links</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {[...resources, ...sections.resources].map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-200 hover:text-brand-gold transition-colors group"
                >
                  <FileText className="w-4 h-4 text-brand-gold/60 group-hover:text-brand-gold" />
                  <span className="flex-1">{resource.label}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Panel */}
      {(contact || sections.contact) && (
        <Card className="bg-gradient-to-r from-brand-blue/40 to-brand-blue/20 border-brand-gold/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-sm font-medium text-brand-gold">
              <Phone className="w-4 h-4" />
              <span>Need Help? Contact Us</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {(contact?.email || sections.contact?.email) && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-brand-gold" />
                  <div>
                    <div className="text-xs text-gray-400">Email</div>
                    <a
                      href={`mailto:${contact?.email || sections.contact?.email}`}
                      className="text-gray-200 hover:text-brand-gold transition-colors"
                    >
                      {contact?.email || sections.contact?.email}
                    </a>
                  </div>
                </div>
              )}
              
              {(contact?.phone || sections.contact?.phone) && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-brand-gold" />
                  <div>
                    <div className="text-xs text-gray-400">Phone</div>
                    <a
                      href={`tel:${contact?.phone || sections.contact?.phone}`}
                      className="text-gray-200 hover:text-brand-gold transition-colors"
                    >
                      {contact?.phone || sections.contact?.phone}
                    </a>
                  </div>
                </div>
              )}
              
              {(contact?.location || sections.contact?.location) && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-brand-gold" />
                  <div>
                    <div className="text-xs text-gray-400">Location</div>
                    <div className="text-gray-200">
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
    
    // Detect sections
    if (line.includes('📚 Resources') || line.includes('Resources & Links')) {
      currentSection = 'resources';
      continue;
    }
    
    if (line.includes('📞 Need Help') || line.includes('Contact')) {
      currentSection = 'contact';
      continue;
    }
    
    // Skip horizontal rules
    if (line.trim() === '---') {
      continue;
    }
    
    // Parse based on current section
    if (currentSection === 'main') {
      mainContent.push(line);
    } else if (currentSection === 'resources') {
      // Extract resource links
      const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        resources.push({
          label: linkMatch[1],
          url: linkMatch[2]
        });
      }
    } else if (currentSection === 'contact') {
      // Extract contact info
      if (line.includes('📧') || line.toLowerCase().includes('email:')) {
        const emailMatch = line.match(/[\w\.-]+@[\w\.-]+\.\w+/);
        if (emailMatch) contact.email = emailMatch[0];
      }
      if (line.includes('📱') || line.toLowerCase().includes('phone:')) {
        const phoneMatch = line.match(/\+?\d{1,3}[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3,4}/);
        if (phoneMatch) contact.phone = phoneMatch[0];
      }
      if (line.includes('📍') || line.toLowerCase().includes('location:')) {
        const locationMatch = line.match(/(?:Location:|📍)\s*\*?\*?(.+)/);
        if (locationMatch) contact.location = locationMatch[1].replace(/\*\*/g, '').trim();
      }
    }
  }
  
  return {
    title,
    mainContent: mainContent.join('\n').trim(),
    resources,
    contact: Object.keys(contact).length > 0 ? contact : null
  };
}

