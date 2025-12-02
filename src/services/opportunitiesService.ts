/**
 * Opportunities Service
 * Fetches grants, jobs, and internships from various APIs
 */

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: 'grant' | 'job' | 'internship';
  category: string;
  url: string;
  image?: string;
  date: string;
  deadline?: string;
  location?: string;
  company?: string;
  salary?: string;
  tags?: string[];
}

// Grants.gov API (using their RESTful API)
const GRANTS_API_BASE = 'https://www.grants.gov/grantsws/rest/opportunities/search/';

// FindWork API for developer jobs
const FINDWORK_API_BASE = 'https://findwork.dev/api/jobs/';

// Internships API
const INTERNSHIPS_API_BASE = 'https://api.internships.com/v1/internships';

/**
 * Fetch grants from Grants.gov
 */
async function fetchGrants(): Promise<Opportunity[]> {
  try {
    // Using a proxy or CORS-enabled endpoint
    // Note: Grants.gov API requires registration for production use
    // For now, we'll return sample data that matches real grant structure
    
    const sampleGrants: Opportunity[] = [
      {
        id: 'grant-1',
        title: 'STEM Education Innovation Grant',
        description: 'Federal grant supporting innovative STEM education programs in underserved communities. Focus on technology integration and hands-on learning experiences.',
        type: 'grant',
        category: 'Education',
        url: 'https://www.grants.gov/search-grants.html',
        image: 'https://images.unsplash.com/photo-1532619187608-e5375cab36aa?w=800&q=80',
        date: new Date().toISOString(),
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'United States',
        tags: ['STEM', 'Education', 'Federal']
      },
      {
        id: 'grant-2',
        title: 'Youth Entrepreneurship Development Fund',
        description: 'Supporting young entrepreneurs in developing innovative business solutions. Grants range from $5,000 to $50,000 for early-stage startups.',
        type: 'grant',
        category: 'Entrepreneurship',
        url: 'https://www.grants.gov/search-grants.html',
        image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80',
        date: new Date().toISOString(),
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Global',
        tags: ['Entrepreneurship', 'Youth', 'Startup']
      },
      {
        id: 'grant-3',
        title: 'Climate Action Research Grant',
        description: 'Funding for research projects addressing climate change impacts in Africa. Priority given to renewable energy and sustainable agriculture projects.',
        type: 'grant',
        category: 'Research',
        url: 'https://www.grants.gov/search-grants.html',
        image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80',
        date: new Date().toISOString(),
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Africa',
        tags: ['Climate', 'Research', 'Sustainability']
      }
    ];

    return sampleGrants;
  } catch (error) {
    console.error('Error fetching grants:', error);
    return [];
  }
}

/**
 * Fetch developer jobs from FindWork
 */
async function fetchJobs(): Promise<Opportunity[]> {
  try {
    // Sample developer jobs data
    const sampleJobs: Opportunity[] = [
      {
        id: 'job-1',
        title: 'Junior Software Engineer',
        description: 'Join our dynamic team building scalable web applications. Work with React, Node.js, and cloud technologies. Perfect for recent graduates.',
        type: 'job',
        category: 'Software Engineering',
        url: 'https://findwork.dev/',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
        date: new Date().toISOString(),
        location: 'Remote',
        company: 'TechCorp Africa',
        salary: '$40,000 - $60,000',
        tags: ['React', 'Node.js', 'Remote']
      },
      {
        id: 'job-2',
        title: 'Data Analyst - Entry Level',
        description: 'Analyze large datasets to drive business decisions. Experience with Python, SQL, and data visualization tools required.',
        type: 'job',
        category: 'Data Science',
        url: 'https://findwork.dev/',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
        date: new Date().toISOString(),
        location: 'Kigali, Rwanda',
        company: 'DataInsights Ltd',
        salary: '$35,000 - $50,000',
        tags: ['Python', 'SQL', 'Analytics']
      },
      {
        id: 'job-3',
        title: 'Full Stack Developer',
        description: 'Build innovative solutions for African markets. Work on both frontend and backend systems using modern technologies.',
        type: 'job',
        category: 'Software Engineering',
        url: 'https://findwork.dev/',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
        date: new Date().toISOString(),
        location: 'Nairobi, Kenya',
        company: 'Innovation Hub',
        salary: '$50,000 - $70,000',
        tags: ['Full Stack', 'JavaScript', 'API']
      },
      {
        id: 'job-4',
        title: 'Machine Learning Engineer',
        description: 'Develop AI solutions for real-world problems. Experience with TensorFlow, PyTorch, and ML algorithms required.',
        type: 'job',
        category: 'AI & Machine Learning',
        url: 'https://findwork.dev/',
        image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&q=80',
        date: new Date().toISOString(),
        location: 'Remote',
        company: 'AI Solutions Africa',
        salary: '$60,000 - $90,000',
        tags: ['Machine Learning', 'Python', 'AI']
      }
    ];

    return sampleJobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
}

/**
 * Fetch internships
 */
async function fetchInternships(): Promise<Opportunity[]> {
  try {
    const sampleInternships: Opportunity[] = [
      {
        id: 'intern-1',
        title: 'Software Engineering Internship',
        description: '3-month paid internship working on real projects. Mentorship from senior engineers. Great opportunity to learn industry best practices.',
        type: 'internship',
        category: 'Software Engineering',
        url: 'https://www.internships.com/',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
        date: new Date().toISOString(),
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Kigali, Rwanda',
        company: 'Tech Innovators',
        salary: '$1,500/month',
        tags: ['Internship', 'Software', 'Paid']
      },
      {
        id: 'intern-2',
        title: 'Data Science Internship',
        description: 'Work with data scientists on machine learning projects. Learn data analysis, visualization, and predictive modeling.',
        type: 'internship',
        category: 'Data Science',
        url: 'https://www.internships.com/',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
        date: new Date().toISOString(),
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Remote',
        company: 'DataCorp',
        salary: '$1,200/month',
        tags: ['Data Science', 'Remote', 'ML']
      },
      {
        id: 'intern-3',
        title: 'UX/UI Design Internship',
        description: 'Design user interfaces for mobile and web applications. Work with design tools like Figma and Adobe XD.',
        type: 'internship',
        category: 'Design',
        url: 'https://www.internships.com/',
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
        date: new Date().toISOString(),
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Cape Town, South Africa',
        company: 'Design Studio Africa',
        salary: '$1,000/month',
        tags: ['Design', 'UI/UX', 'Creative']
      },
      {
        id: 'intern-4',
        title: 'Business Development Internship',
        description: 'Support business growth initiatives. Learn about market research, client relations, and strategic planning.',
        type: 'internship',
        category: 'Business',
        url: 'https://www.internships.com/',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
        date: new Date().toISOString(),
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Lagos, Nigeria',
        company: 'Growth Partners',
        salary: '$1,300/month',
        tags: ['Business', 'Strategy', 'Growth']
      },
      {
        id: 'intern-5',
        title: 'Marketing & Social Media Internship',
        description: 'Create engaging content for social media platforms. Learn digital marketing strategies and analytics.',
        type: 'internship',
        category: 'Marketing',
        url: 'https://www.internships.com/',
        image: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=800&q=80',
        date: new Date().toISOString(),
        deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Remote',
        company: 'Digital Marketing Agency',
        salary: '$900/month',
        tags: ['Marketing', 'Social Media', 'Content']
      }
    ];

    return sampleInternships;
  } catch (error) {
    console.error('Error fetching internships:', error);
    return [];
  }
}

/**
 * Fetch all opportunities
 */
export async function fetchAllOpportunities(): Promise<Opportunity[]> {
  try {
    const [grants, jobs, internships] = await Promise.all([
      fetchGrants(),
      fetchJobs(),
      fetchInternships()
    ]);

    // Combine and shuffle for variety
    const allOpportunities = [...grants, ...jobs, ...internships];
    
    // Sort by date (newest first)
    allOpportunities.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return allOpportunities;
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return [];
  }
}

/**
 * Filter opportunities by type
 */
export function filterOpportunitiesByType(
  opportunities: Opportunity[],
  type: 'grant' | 'job' | 'internship' | 'all'
): Opportunity[] {
  if (type === 'all') return opportunities;
  return opportunities.filter(opp => opp.type === type);
}

/**
 * Search opportunities
 */
export function searchOpportunities(
  opportunities: Opportunity[],
  query: string
): Opportunity[] {
  const lowerQuery = query.toLowerCase();
  return opportunities.filter(opp =>
    opp.title.toLowerCase().includes(lowerQuery) ||
    opp.description.toLowerCase().includes(lowerQuery) ||
    opp.category.toLowerCase().includes(lowerQuery) ||
    opp.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

