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
 * Determine label for a URL based on context and query
 */
function getLabelForUrl(url: string, context: string, fullText: string): string {
  const lowerUrl = url.toLowerCase();
  const lowerContext = context.toLowerCase();
  const lowerFullText = fullText.toLowerCase();
  
  // Help center articles - extract title from URL if possible
  if (lowerUrl.includes('help.alueducation.com')) {
    // Try to extract article name from URL
    const articleMatch = url.match(/articles\/\d+-([^?#]+)/);
    if (articleMatch) {
      // Convert URL slug to readable title
      const slug = articleMatch[1].replace(/-/g, ' ').replace(/_/g, ' ');
      return slug.charAt(0).toUpperCase() + slug.slice(1);
    }
    return 'ALU Help Center Article';
  }
  
  // Library-specific URLs (HIGHEST PRIORITY for library queries)
  if (lowerUrl.includes('library.alueducation.com')) {
    if (lowerContext.includes('manual') || lowerContext.includes('guide')) {
      return 'Download Library User Guide';
    }
    if (lowerUrl.includes('/manual')) {
      return 'Library User Manual';
    }
    return 'Access ALU Library Portal';
  }
  
  // Specific ALU pages
  if (lowerUrl.includes('alueducation.com')) {
    // Check URL path for specific pages
    if (lowerUrl.includes('/programs')) {
      return 'View Academic Programs';
    }
    if (lowerUrl.includes('/admissions')) {
      return 'Admissions Information';
    }
    if (lowerUrl.includes('/contact')) {
      return 'Contact ALU';
    }
    if (lowerUrl.includes('/library')) {
      return 'Library Resources';
    }
    if (lowerUrl.includes('/tuition') || lowerUrl.includes('/fees')) {
      return 'Tuition & Fees Information';
    }
    if (lowerUrl.includes('/apply')) {
      return 'Apply to ALU';
    }
    if (lowerUrl.includes('/scholarships') || lowerUrl.includes('/financial-aid')) {
      return 'Scholarships & Financial Aid';
    }
    if (lowerUrl.includes('/student-life')) {
      return 'Student Life';
    }
    if (lowerUrl.includes('/career')) {
      return 'Career Services';
    }
    
    // Generic ALU website (LOWEST PRIORITY)
    return 'Visit ALU Website';
  }
  
  // Other domains
  if (lowerUrl.includes('ebscohost')) {
    return 'Access EBSCOHost Database';
  }
  if (lowerUrl.includes('buku')) {
    return 'Access BUKU E-Textbooks';
  }
  if (lowerUrl.includes('librarika')) {
    return 'Access LIBRARIKA Catalog';
  }
  
  // Default
  return 'Learn More';
}

/**
 * Prioritize URLs based on relevance to the query
 */
function prioritizeUrls(urls: Array<{ url: string; context: string }>, fullText: string): Array<{ url: string; context: string }> {
  const lowerFullText = fullText.toLowerCase();
  
  // Score each URL
  const scored = urls.map(urlData => {
    let score = 0;
    const lowerUrl = urlData.url.toLowerCase();
    
    // Highest priority: Specific service URLs
    if (lowerUrl.includes('library.alueducation.com')) score += 100;
    if (lowerUrl.includes('ebscohost')) score += 90;
    if (lowerUrl.includes('buku')) score += 90;
    if (lowerUrl.includes('librarika')) score += 90;
    
    // Medium priority: Specific ALU pages
    if (lowerUrl.includes('/programs')) score += 50;
    if (lowerUrl.includes('/admissions')) score += 50;
    if (lowerUrl.includes('/library')) score += 80;
    if (lowerUrl.includes('/apply')) score += 50;
    
    // Context relevance
    if (lowerFullText.includes('library') && lowerUrl.includes('library')) score += 50;
    if (lowerFullText.includes('admission') && lowerUrl.includes('admission')) score += 50;
    if (lowerFullText.includes('program') && lowerUrl.includes('program')) score += 50;
    
    // Lower priority: Generic ALU website
    if (lowerUrl === 'https://www.alueducation.com' || lowerUrl === 'https://www.alueducation.com/') {
      score -= 50; // Penalize generic homepage
    }
    
    return { ...urlData, score };
  });
  
  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score);
  
  // Return sorted URLs without scores
  return scored.map(({ url, context }) => ({ url, context }));
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
  let urlData = extractUrls(response);
  
  // Prioritize URLs based on relevance
  if (urlData.length > 1) {
    urlData = prioritizeUrls(urlData, response);
  }
  
  // Extract contact info
  result.contact = extractContact(response);
  
  // Create Quick Actions from URLs
  if (urlData.length > 0) {
    result.hasStructure = true;
    
    // Primary action (most relevant URL)
    const primaryUrl = urlData[0];
    result.quickActions.push({
      label: getLabelForUrl(primaryUrl.url, primaryUrl.context, response),
      url: primaryUrl.url,
      icon: '🔗'
    });
    
    // Secondary actions (additional relevant URLs)
    for (let i = 1; i < Math.min(urlData.length, 3); i++) {
      const urlInfo = urlData[i];
      const label = getLabelForUrl(urlInfo.url, urlInfo.context, response);
      
      // Skip if it's a duplicate label or generic website
      if (label !== 'Visit ALU Website' || urlData.length === 1) {
        result.quickActions.push({
          label: label,
          url: urlInfo.url,
          icon: '📄'
        });
      }
    }
  }
  
  // Create Resources from URLs (prioritized, deduplicated)
  if (urlData.length > 0) {
    const seenUrls = new Set<string>();
    const seenLabels = new Set<string>();
    
    urlData.forEach((urlInfo, index) => {
      // Skip if we've already seen this URL
      if (seenUrls.has(urlInfo.url)) return;
      
      const label = getLabelForUrl(urlInfo.url, urlInfo.context, response);
      
      // Skip generic website in resources if we have better options
      if (label === 'Visit ALU Website' && urlData.length > 1 && index > 0) {
        return; // Skip this URL
      }
      
      // Skip if we've seen this exact label (prevents duplicate "Admissions Portal" etc)
      if (seenLabels.has(label)) return;
      
      seenUrls.add(urlInfo.url);
      seenLabels.add(label);
      
      result.resources.push({
        label: label,
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

