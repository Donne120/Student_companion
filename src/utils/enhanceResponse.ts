/**
 * Enhance plain responses by extracting and structuring information
 * This adds Quick Actions, Resources, and Contact sections even when
 * the backend doesn't send them in structured format
 */

interface EnhancedResponse {
  hasStructure: boolean;
  quickActions: Array<{ label: string; url: string; icon: string }>;
  mainContent: string;
  resources: Array<{ label: string; url: string }>;
  contact: {
    email?: string;
    phone?: string;
    location?: string;
  };
}

/**
 * Extract URLs from text
 */
function extractUrls(text: string): Array<{ url: string; context: string }> {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.matchAll(urlRegex);
  const urls: Array<{ url: string; context: string }> = [];
  
  for (const match of matches) {
    const url = match[0];
    const startIndex = match.index || 0;
    // Get context around the URL (50 chars before and after)
    const contextStart = Math.max(0, startIndex - 50);
    const contextEnd = Math.min(text.length, startIndex + url.length + 50);
    const context = text.substring(contextStart, contextEnd);
    
    urls.push({ url, context });
  }
  
  return urls;
}

/**
 * Extract contact information from text
 */
function extractContact(text: string): { email?: string; phone?: string; location?: string } {
  const contact: { email?: string; phone?: string; location?: string } = {};
  
  // Extract email
  const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
  if (emailMatch) {
    contact.email = emailMatch[0];
  }
  
  // Extract phone
  const phoneMatch = text.match(/\+?\d{1,3}[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3,4}/);
  if (phoneMatch) {
    contact.phone = phoneMatch[0];
  }
  
  // Extract location (common patterns)
  const locationPatterns = [
    /(?:located at|location:|address:)\s*([^.]+)/i,
    /Bumbogo[^.]+/i,
    /Kigali[^.]+/i
  ];
  
  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) {
      contact.location = match[0].replace(/^(located at|location:|address:)\s*/i, '').trim();
      break;
    }
  }
  
  return contact;
}

/**
 * Determine label for a URL based on context
 */
function getLabelForUrl(url: string, context: string): string {
  const lowerUrl = url.toLowerCase();
  const lowerContext = context.toLowerCase();
  
  // Library-specific
  if (lowerUrl.includes('library.alueducation.com')) {
    if (lowerContext.includes('manual') || lowerContext.includes('guide')) {
      return 'Library User Guide';
    }
    return 'Access ALU Library Portal';
  }
  
  // General ALU website
  if (lowerUrl.includes('alueducation.com')) {
    if (lowerUrl.includes('/programs')) {
      return 'View Academic Programs';
    }
    if (lowerUrl.includes('/admissions')) {
      return 'Admissions Information';
    }
    if (lowerUrl.includes('/contact')) {
      return 'Contact ALU';
    }
    return 'Visit ALU Website';
  }
  
  // Default
  return 'Learn More';
}

/**
 * Remove URLs and contact info from main content
 */
function cleanMainContent(text: string, urls: string[], contact: any): string {
  let cleaned = text;
  
  // Remove URLs
  urls.forEach(url => {
    cleaned = cleaned.replace(url, '');
  });
  
  // Remove contact lines
  if (contact.email) {
    cleaned = cleaned.replace(new RegExp(`.*${contact.email}.*`, 'g'), '');
  }
  if (contact.phone) {
    cleaned = cleaned.replace(new RegExp(`.*${contact.phone}.*`, 'g'), '');
  }
  
  // Clean up extra whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.replace(/  +/g, ' ');
  
  return cleaned.trim();
}

/**
 * Enhance a plain response by adding structure
 */
export function enhanceResponse(response: string): EnhancedResponse {
  const result: EnhancedResponse = {
    hasStructure: false,
    quickActions: [],
    mainContent: response,
    resources: [],
    contact: {}
  };
  
  // Check if already structured
  if (response.includes('🔗 Quick Actions') || 
      response.includes('**Quick Actions:**') ||
      response.includes('📚 Resources') ||
      response.includes('📞 Need Help')) {
    result.hasStructure = true;
    return result;
  }
  
  // Extract URLs
  const urlData = extractUrls(response);
  
  // Extract contact info
  result.contact = extractContact(response);
  
  // Create Quick Actions from URLs
  if (urlData.length > 0) {
    result.hasStructure = true;
    
    // Primary action (first URL)
    const primaryUrl = urlData[0];
    result.quickActions.push({
      label: getLabelForUrl(primaryUrl.url, primaryUrl.context),
      url: primaryUrl.url,
      icon: '🔗'
    });
    
    // Secondary actions (additional URLs)
    for (let i = 1; i < Math.min(urlData.length, 3); i++) {
      const urlInfo = urlData[i];
      result.quickActions.push({
        label: getLabelForUrl(urlInfo.url, urlInfo.context),
        url: urlInfo.url,
        icon: '📄'
      });
    }
  }
  
  // Create Resources from URLs
  if (urlData.length > 0) {
    urlData.forEach((urlInfo, index) => {
      result.resources.push({
        label: index === 0 ? 'Main Portal' : `Resource ${index + 1}`,
        url: urlInfo.url
      });
    });
  }
  
  // Clean main content
  const allUrls = urlData.map(u => u.url);
  result.mainContent = cleanMainContent(response, allUrls, result.contact);
  
  return result;
}

/**
 * Format enhanced response as structured markdown
 */
export function formatEnhancedResponse(enhanced: EnhancedResponse): string {
  const parts: string[] = [];
  
  // Quick Actions
  if (enhanced.quickActions.length > 0) {
    const actions = enhanced.quickActions
      .map(a => `[${a.label}](${a.url})`)
      .join(' | ');
    parts.push(`🔗 **Quick Actions:** ${actions}`);
    parts.push('');
  }
  
  // Main Content
  parts.push(enhanced.mainContent);
  
  // Resources
  if (enhanced.resources.length > 0) {
    parts.push('');
    parts.push('---');
    parts.push('**📚 Resources & Links:**');
    enhanced.resources.forEach((resource, index) => {
      const label = index === 0 ? 'Main Portal' : 'Additional Resource';
      parts.push(`• **${label}:** [${resource.label}](${resource.url})`);
    });
  }
  
  // Contact
  if (enhanced.contact.email || enhanced.contact.phone || enhanced.contact.location) {
    parts.push('');
    parts.push('---');
    parts.push('**📞 Need Help? Contact Us:**');
    
    if (enhanced.contact.email) {
      parts.push(`📧 **Email:** ${enhanced.contact.email}`);
    }
    if (enhanced.contact.phone) {
      parts.push(`📱 **Phone:** ${enhanced.contact.phone}`);
    }
    if (enhanced.contact.location) {
      parts.push(`📍 **Location:** ${enhanced.contact.location}`);
    }
  }
  
  return parts.join('\n');
}

