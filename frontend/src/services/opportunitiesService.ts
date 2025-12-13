/**
 * Opportunities Service
 * Fetches and manages opportunities (grants, jobs, internships) from various APIs
 */

export interface Opportunity {
  id: string;
  title: string;
  type: 'grant' | 'job' | 'internship';
  organization: string;
  location: string;
  description: string;
  deadline?: string;
  salary?: string;
  url: string;
  postedDate: string;
  tags: string[];
}

// Sample data - In production, these would come from actual APIs
const sampleOpportunities: Opportunity[] = [
  // Grants
  {
    id: 'grant-1',
    title: 'African Leadership Research Grant',
    type: 'grant',
    organization: 'African Development Bank',
    location: 'Pan-African',
    description: 'Research grants for innovative solutions to African challenges in technology, agriculture, and sustainable development.',
    deadline: '2025-03-15',
    url: 'https://www.afdb.org/grants',
    postedDate: '2024-12-01',
    tags: ['research', 'innovation', 'development']
  },
  {
    id: 'grant-2',
    title: 'Youth Entrepreneurship Fund',
    type: 'grant',
    organization: 'Mastercard Foundation',
    location: 'East Africa',
    description: 'Funding for young entrepreneurs building scalable businesses that create employment opportunities.',
    deadline: '2025-02-28',
    url: 'https://mastercardfdn.org/youth-fund',
    postedDate: '2024-11-28',
    tags: ['entrepreneurship', 'startup', 'youth']
  },
  {
    id: 'grant-3',
    title: 'Climate Innovation Challenge',
    type: 'grant',
    organization: 'USAID',
    location: 'Global',
    description: 'Grants for climate-smart solutions addressing environmental challenges in developing countries.',
    deadline: '2025-04-01',
    url: 'https://www.usaid.gov/climate',
    postedDate: '2024-12-02',
    tags: ['climate', 'environment', 'innovation']
  },
  
  // Jobs
  {
    id: 'job-1',
    title: 'Software Engineer',
    type: 'job',
    organization: 'Andela',
    location: 'Kigali, Rwanda',
    description: 'Join our engineering team building products that connect African talent with global opportunities.',
    salary: '$40,000 - $60,000',
    url: 'https://andela.com/careers',
    postedDate: '2024-12-01',
    tags: ['engineering', 'software', 'remote']
  },
  {
    id: 'job-2',
    title: 'Data Analyst',
    type: 'job',
    organization: 'MTN Rwanda',
    location: 'Kigali, Rwanda',
    description: 'Analyze customer data and market trends to drive business decisions and improve services.',
    salary: '$35,000 - $50,000',
    url: 'https://mtn.co.rw/careers',
    postedDate: '2024-11-30',
    tags: ['data', 'analytics', 'telecom']
  },
  {
    id: 'job-3',
    title: 'Product Manager',
    type: 'job',
    organization: 'Flutterwave',
    location: 'Lagos, Nigeria (Remote OK)',
    description: 'Lead product development for payment solutions serving millions across Africa.',
    salary: '$50,000 - $80,000',
    url: 'https://flutterwave.com/careers',
    postedDate: '2024-12-02',
    tags: ['product', 'fintech', 'leadership']
  },
  
  // Internships
  {
    id: 'intern-1',
    title: 'Summer Technology Internship',
    type: 'internship',
    organization: 'Google',
    location: 'Nairobi, Kenya',
    description: '12-week internship program for students passionate about technology and innovation.',
    deadline: '2025-01-31',
    url: 'https://careers.google.com/students',
    postedDate: '2024-11-25',
    tags: ['tech', 'summer', 'google']
  },
  {
    id: 'intern-2',
    title: 'Management Consulting Intern',
    type: 'internship',
    organization: 'McKinsey & Company',
    location: 'Johannesburg, South Africa',
    description: 'Work on real client projects and develop consulting skills with world-class mentors.',
    deadline: '2025-02-15',
    url: 'https://mckinsey.com/careers',
    postedDate: '2024-11-28',
    tags: ['consulting', 'business', 'strategy']
  },
  {
    id: 'intern-3',
    title: 'Social Impact Internship',
    type: 'internship',
    organization: 'World Bank',
    location: 'Kigali, Rwanda',
    description: 'Support development projects focused on poverty reduction and economic growth in Rwanda.',
    deadline: '2025-03-01',
    url: 'https://worldbank.org/careers',
    postedDate: '2024-12-01',
    tags: ['development', 'policy', 'impact']
  }
];

// Fetch all opportunities
export async function fetchOpportunities(): Promise<Opportunity[]> {
  // In production, this would make actual API calls
  // For now, return sample data with a small delay to simulate network
  await new Promise(resolve => setTimeout(resolve, 500));
  return sampleOpportunities;
}

// Fetch opportunities by type
export async function fetchOpportunitiesByType(type: 'grant' | 'job' | 'internship'): Promise<Opportunity[]> {
  const all = await fetchOpportunities();
  return all.filter(opp => opp.type === type);
}

// Search opportunities
export async function searchOpportunities(query: string): Promise<Opportunity[]> {
  const all = await fetchOpportunities();
  const queryLower = query.toLowerCase();
  
  return all.filter(opp => 
    opp.title.toLowerCase().includes(queryLower) ||
    opp.organization.toLowerCase().includes(queryLower) ||
    opp.description.toLowerCase().includes(queryLower) ||
    opp.tags.some(tag => tag.toLowerCase().includes(queryLower))
  );
}

// Get upcoming deadlines
export async function getUpcomingDeadlines(days: number = 30): Promise<Opportunity[]> {
  const all = await fetchOpportunities();
  const now = new Date();
  const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  return all
    .filter(opp => opp.deadline && new Date(opp.deadline) <= cutoff)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
}

// Format opportunity for display
export function formatOpportunityForChat(opp: Opportunity): string {
  let result = `**${opp.title}**\n`;
  result += `*${opp.organization}* - ${opp.location}\n`;
  result += `${opp.description}\n`;
  
  if (opp.salary) {
    result += `💰 Salary: ${opp.salary}\n`;
  }
  
  if (opp.deadline) {
    result += `📅 Deadline: ${new Date(opp.deadline).toLocaleDateString()}\n`;
  }
  
  result += `🔗 [Apply Here](${opp.url})`;
  
  return result;
}

export const opportunitiesService = {
  fetchOpportunities,
  fetchOpportunitiesByType,
  searchOpportunities,
  getUpcomingDeadlines,
  formatOpportunityForChat
};

export default opportunitiesService;

