/**
 * University Admin Data Access Utility
 * Provides the main chatbot access to all University Admin information
 */

import { learningCoaches, missionCurators, belProgram, departments, administrationOffices } from "@/components/mini-chatbot/mockData";

export interface UniversityAdminData {
  learningCoaches: typeof learningCoaches;
  missionCurators: typeof missionCurators;
  belProgram: typeof belProgram;
  departments: typeof departments;
  administrationOffices: typeof administrationOffices;
}

/**
 * Get all University Admin data
 */
export const getUniversityAdminData = (): UniversityAdminData => {
  return {
    learningCoaches,
    missionCurators,
    belProgram,
    departments,
    administrationOffices
  };
};

/**
 * Search for faculty/staff by name
 */
export const searchFacultyByName = (searchTerm: string) => {
  const allPeople = [
    ...learningCoaches,
    ...missionCurators,
    ...belProgram
  ];
  
  const term = searchTerm.toLowerCase();
  return allPeople.filter(person => 
    person.name.toLowerCase().includes(term)
  );
};

/**
 * Search by role/course
 */
export const searchByRole = (searchTerm: string) => {
  const allPeople = [
    ...learningCoaches,
    ...missionCurators,
    ...belProgram
  ];
  
  const term = searchTerm.toLowerCase();
  return allPeople.filter(person => 
    person.course?.toLowerCase().includes(term) ||
    person.missionArea?.toLowerCase().includes(term) ||
    person.department?.toLowerCase().includes(term)
  );
};

/**
 * Get Mission Curators by mission area
 */
export const getMissionCuratorByArea = (area: string) => {
  const term = area.toLowerCase();
  return missionCurators.filter(curator => 
    curator.missionArea?.toLowerCase().includes(term)
  );
};

/**
 * Get all faculty with booking links
 */
export const getFacultyWithBookingLinks = () => {
  const allPeople = [
    ...learningCoaches,
    ...missionCurators,
    ...belProgram
  ];
  
  return allPeople.filter(person => person.calendarLink);
};

/**
 * Format faculty information for chatbot response
 */
export const formatFacultyInfo = (person: typeof learningCoaches[0]) => {
  let info = `**${person.name}**\n`;
  
  if (person.course) {
    info += `- Role: ${person.course}\n`;
  }
  
  if (person.missionArea) {
    info += `- Mission Area: ${person.missionArea}\n`;
  }
  
  if (person.department) {
    info += `- Department: ${person.department}\n`;
  }
  
  if (person.email) {
    info += `- Email: ${person.email}\n`;
  }
  
  if (person.bio) {
    info += `- About: ${person.bio}\n`;
  }
  
  if (person.calendarLink) {
    info += `- 📅 [Book Office Hours](${person.calendarLink})\n`;
  }
  
  return info;
};

/**
 * Format multiple faculty members for chatbot response
 */
export const formatMultipleFaculty = (people: typeof learningCoaches) => {
  if (people.length === 0) {
    return "I couldn't find any faculty members matching your criteria.";
  }
  
  let response = `I found ${people.length} faculty member${people.length > 1 ? 's' : ''}:\n\n`;
  
  people.forEach((person, index) => {
    response += `${index + 1}. ${formatFacultyInfo(person)}\n`;
  });
  
  return response;
};

/**
 * Get comprehensive University Admin summary
 */
export const getUniversityAdminSummary = () => {
  return `
# University Admin Resources

## Learning Coaches & Faculty (${learningCoaches.length} members)
- Foundation Programme coaches
- BEL Specialisation coaches
- E-Lab coordinators
- Software Engineering coaches
- Mission Curators

## Mission Curators (${missionCurators.length} areas)
${missionCurators.map(c => `- ${c.name} (${c.missionArea})`).join('\n')}

## BEL Program
${belProgram.map(p => `- ${p.name} - ${p.department}`).join('\n')}

## Academic Departments (${departments.length})
${departments.map(d => `- ${d.name}`).join('\n')}

## Administration Offices (${administrationOffices.length})
${administrationOffices.map(a => `- ${a.name}`).join('\n')}

**Need help?** Visit [ALU Help Center](https://help.alueducation.com)
`;
};

/**
 * Check if a query is asking for University Admin information
 */
export const isUniversityAdminQuery = (query: string): boolean => {
  const keywords = [
    'faculty', 'coach', 'learning coach', 'professor', 'teacher', 'instructor',
    'mission curator', 'office hours', 'book', 'appointment', 'schedule',
    'bel program', 'foundation', 'e-lab', 'software engineering',
    'who teaches', 'who is', 'contact', 'email',
    'department', 'administration', 'registrar', 'financial aid'
  ];
  
  const lowerQuery = query.toLowerCase();
  return keywords.some(keyword => lowerQuery.includes(keyword));
};

/**
 * Process University Admin query and return formatted response
 */
export const processUniversityAdminQuery = (query: string): string | null => {
  const lowerQuery = query.toLowerCase();
  
  // Check for specific name searches
  const nameMatch = searchFacultyByName(query);
  if (nameMatch.length > 0) {
    return formatMultipleFaculty(nameMatch);
  }
  
  // Check for role/course searches
  const roleMatch = searchByRole(query);
  if (roleMatch.length > 0) {
    return formatMultipleFaculty(roleMatch);
  }
  
  // Check for mission curator queries
  if (lowerQuery.includes('mission curator')) {
    if (lowerQuery.includes('climate')) {
      const result = getMissionCuratorByArea('climate');
      return formatMultipleFaculty(result);
    }
    if (lowerQuery.includes('governance')) {
      const result = getMissionCuratorByArea('governance');
      return formatMultipleFaculty(result);
    }
    if (lowerQuery.includes('agriculture')) {
      const result = getMissionCuratorByArea('agriculture');
      return formatMultipleFaculty(result);
    }
    // Return all mission curators
    return formatMultipleFaculty(missionCurators);
  }
  
  // Check for booking/office hours queries
  if (lowerQuery.includes('book') || lowerQuery.includes('office hours') || lowerQuery.includes('appointment')) {
    const withLinks = getFacultyWithBookingLinks();
    return `Here are faculty members with available office hours booking:\n\n${formatMultipleFaculty(withLinks)}`;
  }
  
  // Check for general University Admin query
  if (lowerQuery.includes('university admin') || lowerQuery.includes('faculty list') || lowerQuery.includes('all faculty')) {
    return getUniversityAdminSummary();
  }
  
  return null;
};

