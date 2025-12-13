/**
 * Parse enhanced responses from the backend
 * Extracts quick actions, contact info, and resource links
 */

interface QuickAction {
  label: string;
  url: string;
  icon?: string;
  type?: 'primary' | 'secondary' | 'link';
}

interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
}

interface ResourceLink {
  label: string;
  url: string;
  type?: 'primary' | 'secondary' | 'link';
}

export interface ParsedResponse {
  quickActions: QuickAction[];
  mainContent: string;
  resources: ResourceLink[];
  contact: ContactInfo;
  hasStructuredData: boolean;
}

export function parseEnhancedResponse(response: string): ParsedResponse {
  const result: ParsedResponse = {
    quickActions: [],
    mainContent: response,
    resources: [],
    contact: {},
    hasStructuredData: false
  };

  // Check if response has structured format
  if (!response.includes('Quick Actions:') && 
      !response.includes('Resources & Links:') && 
      !response.includes('Need Help? Contact')) {
    return result;
  }

  result.hasStructuredData = true;

  // Split response into sections
  const sections = response.split(/---+/);
  
  let mainContentParts: string[] = [];

  sections.forEach((section, index) => {
    const trimmedSection = section.trim();

    // Parse Quick Actions section
    if (trimmedSection.includes('**Quick Actions:**') || trimmedSection.includes('Quick Actions:')) {
      const actionsMatch = trimmedSection.match(/\[([^\]]+)\]\(([^)]+)\)/g);
      if (actionsMatch) {
        actionsMatch.forEach((match, idx) => {
          const labelMatch = match.match(/\[([^\]]+)\]/);
          const urlMatch = match.match(/\(([^)]+)\)/);
          
          if (labelMatch && urlMatch) {
            const label = labelMatch[1].replace(/\*\*/g, '');
            const url = urlMatch[1];
            
            // Determine icon from label or position
            let icon = '🔗';
            if (label.toLowerCase().includes('guide') || label.toLowerCase().includes('manual')) {
              icon = '📄';
            } else if (label.toLowerCase().includes('download')) {
              icon = '📥';
            }

            result.quickActions.push({
              label,
              url,
              icon,
              type: idx === 0 ? 'primary' : 'secondary'
            });
          }
        });
      }
    }

    // Parse Resources & Links section
    else if (trimmedSection.includes('**📚 Resources') || trimmedSection.includes('Resources & Links:')) {
      const linksMatch = trimmedSection.match(/\[([^\]]+)\]\(([^)]+)\)/g);
      if (linksMatch) {
        linksMatch.forEach((match) => {
          const labelMatch = match.match(/\[([^\]]+)\]/);
          const urlMatch = match.match(/\(([^)]+)\)/);
          
          if (labelMatch && urlMatch) {
            const fullLabel = labelMatch[1];
            const url = urlMatch[1];
            
            // Determine type from label
            let type: 'primary' | 'secondary' | 'link' = 'link';
            let label = fullLabel;
            
            if (fullLabel.includes('Main Portal:')) {
              type = 'primary';
              label = fullLabel.replace('Main Portal:', '').trim();
            } else if (fullLabel.includes('Documentation:')) {
              type = 'secondary';
              label = fullLabel.replace('Documentation:', '').trim();
            }

            result.resources.push({
              label,
              url,
              type
            });
          }
        });
      }
    }

    // Parse Contact section
    else if (trimmedSection.includes('**📞 Need Help') || trimmedSection.includes('Contact Us:')) {
      // Extract email
      const emailMatch = trimmedSection.match(/📧[^:]*:\s*([^\s\n]+@[^\s\n]+)/);
      if (emailMatch) {
        result.contact.email = emailMatch[1];
      }

      // Extract phone
      const phoneMatch = trimmedSection.match(/📱[^:]*:\s*([+\d\s-]+)/);
      if (phoneMatch) {
        result.contact.phone = phoneMatch[1].trim();
      }

      // Extract location
      const locationMatch = trimmedSection.match(/📍[^:]*:\s*([^\n]+)/);
      if (locationMatch) {
        result.contact.location = locationMatch[1].trim();
      }
    }

    // Main content (skip sections with structured data markers)
    else if (index === 0 || (!trimmedSection.includes('📚 Resources') && 
                              !trimmedSection.includes('📞 Need Help') &&
                              !trimmedSection.includes('Quick Actions'))) {
      if (trimmedSection.length > 0) {
        mainContentParts.push(trimmedSection);
      }
    }
  });

  // Clean up main content
  result.mainContent = mainContentParts.join('\n\n---\n\n').trim();
  
  // Remove any remaining structured markers from main content
  result.mainContent = result.mainContent
    .replace(/\*\*Quick Actions:\*\*[^\n]*\n/g, '')
    .replace(/🔗[^\n]*\n/g, '')
    .trim();

  return result;
}

/**
 * Check if a response has enhanced formatting
 */
export function hasEnhancedFormatting(response: string): boolean {
  return response.includes('Quick Actions:') || 
         response.includes('Resources & Links:') || 
         response.includes('Need Help? Contact');
}

