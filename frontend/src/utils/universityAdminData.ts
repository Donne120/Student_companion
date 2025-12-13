/**
 * University Admin Data
 * Contains all the data from the University Admin mini chatbot
 * for integration with the main chatbot
 */

export interface UniversityAdminPerson {
  name: string;
  role: string;
  email?: string;
  phone?: string;
  calendarLink?: string;
  missionArea?: string;
  bio?: string;
}

export interface UniversityAdminOffice {
  name: string;
  email: string;
  phone?: string;
  hours?: string;
  description?: string;
}

// Mission Curators
export const missionCurators: UniversityAdminPerson[] = [
  {
    name: "Marvin Ogore",
    role: "Mission Curator",
    missionArea: "Climate & Environment",
    email: "m.ogore@alueducation.com",
    calendarLink: "https://calendar.app.google/mGT8QJXB8Vqf9dWX6",
    bio: "Marvin leads the Climate & Environment mission, helping students develop solutions for environmental sustainability and climate action across Africa."
  },
  {
    name: "Sandrine Mukamusoni",
    role: "Mission Curator",
    missionArea: "Education",
    email: "s.mukamusoni@alueducation.com",
    calendarLink: "https://calendly.com/alu-mission-curator",
    bio: "Sandrine guides students passionate about transforming education systems and improving learning outcomes across the continent."
  },
  {
    name: "Jean-Pierre Habimana",
    role: "Mission Curator",
    missionArea: "Healthcare",
    email: "jp.habimana@alueducation.com",
    calendarLink: "https://calendly.com/alu-mission-curator",
    bio: "Jean-Pierre supports students working on healthcare innovation, public health initiatives, and medical technology solutions."
  },
  {
    name: "Amara Diallo",
    role: "Mission Curator",
    missionArea: "Infrastructure & Urbanization",
    email: "a.diallo@alueducation.com",
    calendarLink: "https://calendly.com/alu-mission-curator",
    bio: "Amara mentors students focused on sustainable urban development, smart cities, and infrastructure solutions for growing African cities."
  },
  {
    name: "Fatima Nkosi",
    role: "Mission Curator",
    missionArea: "Financial Inclusion",
    email: "f.nkosi@alueducation.com",
    calendarLink: "https://calendly.com/alu-mission-curator",
    bio: "Fatima guides students developing fintech solutions and financial services to increase economic participation across Africa."
  },
  {
    name: "Emmanuel Okonkwo",
    role: "Mission Curator",
    missionArea: "Agriculture & Food Security",
    email: "e.okonkwo@alueducation.com",
    calendarLink: "https://calendly.com/alu-mission-curator",
    bio: "Emmanuel supports students innovating in agricultural technology, food systems, and sustainable farming practices."
  },
  {
    name: "Grace Mutesi",
    role: "Mission Curator",
    missionArea: "Governance & Policy",
    email: "g.mutesi@alueducation.com",
    calendarLink: "https://calendly.com/alu-mission-curator",
    bio: "Grace mentors students interested in public policy, governance reform, and civic technology for better African institutions."
  }
];

// BEL Program Manager
export const belProgram: UniversityAdminPerson[] = [
  {
    name: "Arnaud Michel Nibaruta",
    role: "BEL Program Manager",
    email: "a.nibaruta@alueducation.com",
    calendarLink: "https://calendly.com/alu-bel-program",
    bio: "Arnaud oversees the Business and Entrepreneurial Leadership program, guiding students through their entrepreneurial journey and venture development."
  }
];

// Learning Coaches / Faculty
export const learningCoaches: UniversityAdminPerson[] = [
  {
    name: "Dr. Sarah Mensah",
    role: "Learning Coach - Computer Science",
    email: "s.mensah@alueducation.com",
    calendarLink: "https://calendly.com/alu-faculty"
  },
  {
    name: "Prof. James Ochieng",
    role: "Learning Coach - Business",
    email: "j.ochieng@alueducation.com",
    calendarLink: "https://calendly.com/alu-faculty"
  },
  {
    name: "Dr. Amina Yusuf",
    role: "Learning Coach - Data Science",
    email: "a.yusuf@alueducation.com",
    calendarLink: "https://calendly.com/alu-faculty"
  },
  {
    name: "Prof. David Kimani",
    role: "Learning Coach - Entrepreneurship",
    email: "d.kimani@alueducation.com",
    calendarLink: "https://calendly.com/alu-faculty"
  },
  {
    name: "Dr. Grace Akinyi",
    role: "Learning Coach - Leadership",
    email: "g.akinyi@alueducation.com",
    calendarLink: "https://calendly.com/alu-faculty"
  }
];

// Administration Offices
export const administrationOffices: UniversityAdminOffice[] = [
  {
    name: "Admissions Office",
    email: "admissions@alueducation.com",
    phone: "+250 788 123 456",
    hours: "Monday-Friday, 8:00 AM - 5:00 PM",
    description: "Handles all admission inquiries, applications, and enrollment processes."
  },
  {
    name: "Registrar Office",
    email: "registrar@alueducation.com",
    phone: "+250 788 123 457",
    hours: "Monday-Friday, 8:00 AM - 5:00 PM",
    description: "Manages academic records, transcripts, course registration, and graduation requirements."
  },
  {
    name: "Financial Aid Office",
    email: "financialaid@alueducation.com",
    phone: "+250 788 123 458",
    hours: "Monday-Friday, 9:00 AM - 4:00 PM",
    description: "Provides information on scholarships, grants, loans, and payment plans."
  },
  {
    name: "Student Affairs",
    email: "studentaffairs@alueducation.com",
    phone: "+250 788 123 459",
    hours: "Monday-Friday, 8:00 AM - 6:00 PM",
    description: "Supports student life, housing, clubs, events, and general welfare."
  },
  {
    name: "Career Development",
    email: "careers@alueducation.com",
    phone: "+250 788 123 460",
    hours: "Monday-Friday, 9:00 AM - 5:00 PM",
    description: "Offers career counseling, job placement, internship support, and professional development."
  },
  {
    name: "International Student Services",
    email: "international@alueducation.com",
    phone: "+250 788 123 461",
    hours: "Monday-Friday, 9:00 AM - 4:00 PM",
    description: "Assists international students with visas, immigration, and cultural adjustment."
  },
  {
    name: "IT Support",
    email: "helpdesk@alueducation.com",
    phone: "+250 788 123 462",
    hours: "Monday-Friday, 8:00 AM - 8:00 PM; Saturday 10:00 AM - 4:00 PM",
    description: "Provides technical support for student portal, email, WiFi, and campus technology."
  }
];

// Academic Departments
export const academicDepartments = [
  {
    name: "Software Engineering",
    faculty: [
      { name: "Dr. Patrick Mugisha", role: "Department Head", email: "p.mugisha@alueducation.com" },
      { name: "Prof. Linda Osei", role: "Senior Lecturer", email: "l.osei@alueducation.com" },
      { name: "Dr. Michael Ndegwa", role: "Lecturer", email: "m.ndegwa@alueducation.com" }
    ]
  },
  {
    name: "Business & Entrepreneurship",
    faculty: [
      { name: "Dr. Josephine Uwimana", role: "Department Head", email: "j.uwimana@alueducation.com" },
      { name: "Prof. Samuel Asante", role: "Senior Lecturer", email: "s.asante@alueducation.com" },
      { name: "Dr. Rebecca Mwangi", role: "Lecturer", email: "r.mwangi@alueducation.com" }
    ]
  },
  {
    name: "Global Challenges",
    faculty: [
      { name: "Dr. Emmanuel Habimana", role: "Department Head", email: "e.habimana@alueducation.com" },
      { name: "Prof. Aisha Diop", role: "Senior Lecturer", email: "a.diop@alueducation.com" }
    ]
  },
  {
    name: "Leadership Studies",
    faculty: [
      { name: "Dr. Christine Nyiransabimana", role: "Department Head", email: "c.nyiransabimana@alueducation.com" },
      { name: "Prof. Daniel Okonkwo", role: "Senior Lecturer", email: "d.okonkwo@alueducation.com" }
    ]
  }
];

// Check if a query is related to University Admin data
export function isUniversityAdminQuery(query: string): boolean {
  const keywords = [
    'mission curator', 'curator', 'bel program', 'bel manager',
    'learning coach', 'faculty', 'professor', 'lecturer', 'teacher',
    'admissions', 'registrar', 'financial aid', 'student affairs',
    'career', 'international', 'it support', 'helpdesk',
    'department', 'software engineering', 'business', 'entrepreneurship',
    'university admin', 'contact', 'email', 'phone', 'office hours',
    'book appointment', 'calendar', 'schedule meeting',
    'who is', 'how to contact', 'reach out to'
  ];
  
  const queryLower = query.toLowerCase();
  return keywords.some(keyword => queryLower.includes(keyword));
}

// Process University Admin query
export function processUniversityAdminQuery(query: string): string | null {
  const queryLower = query.toLowerCase();
  
  // Mission Curators
  if (queryLower.includes('mission curator') || queryLower.includes('curator')) {
    let response = "## Mission Curators at ALU\n\n";
    response += "Mission Curators guide students in their chosen mission areas:\n\n";
    
    for (const curator of missionCurators) {
      response += `### ${curator.name}\n`;
      response += `**Mission Area:** ${curator.missionArea}\n`;
      response += `**Email:** ${curator.email}\n`;
      if (curator.calendarLink) {
        response += `**Book Appointment:** [Schedule Meeting](${curator.calendarLink})\n`;
      }
      response += `\n${curator.bio}\n\n`;
    }
    
    return response;
  }
  
  // BEL Program
  if (queryLower.includes('bel program') || queryLower.includes('bel manager')) {
    const manager = belProgram[0];
    let response = "## BEL Program Manager\n\n";
    response += `### ${manager.name}\n`;
    response += `**Role:** ${manager.role}\n`;
    response += `**Email:** ${manager.email}\n`;
    if (manager.calendarLink) {
      response += `**Book Appointment:** [Schedule Meeting](${manager.calendarLink})\n`;
    }
    response += `\n${manager.bio}\n`;
    
    return response;
  }
  
  // Learning Coaches / Faculty
  if (queryLower.includes('learning coach') || queryLower.includes('faculty') || 
      queryLower.includes('professor') || queryLower.includes('lecturer')) {
    let response = "## Learning Coaches & Faculty\n\n";
    
    for (const coach of learningCoaches) {
      response += `### ${coach.name}\n`;
      response += `**Role:** ${coach.role}\n`;
      response += `**Email:** ${coach.email}\n`;
      if (coach.calendarLink) {
        response += `**Book Appointment:** [Schedule Meeting](${coach.calendarLink})\n`;
      }
      response += "\n";
    }
    
    return response;
  }
  
  // Administration Offices
  if (queryLower.includes('admissions') || queryLower.includes('registrar') ||
      queryLower.includes('financial aid') || queryLower.includes('student affairs') ||
      queryLower.includes('career') || queryLower.includes('international') ||
      queryLower.includes('it support') || queryLower.includes('helpdesk') ||
      queryLower.includes('office')) {
    
    // Find specific office if mentioned
    for (const office of administrationOffices) {
      if (queryLower.includes(office.name.toLowerCase())) {
        let response = `## ${office.name}\n\n`;
        response += `**Email:** ${office.email}\n`;
        if (office.phone) response += `**Phone:** ${office.phone}\n`;
        if (office.hours) response += `**Hours:** ${office.hours}\n`;
        response += `\n${office.description}\n`;
        return response;
      }
    }
    
    // Return all offices
    let response = "## Administration Offices\n\n";
    for (const office of administrationOffices) {
      response += `### ${office.name}\n`;
      response += `**Email:** ${office.email}\n`;
      if (office.phone) response += `**Phone:** ${office.phone}\n`;
      if (office.hours) response += `**Hours:** ${office.hours}\n`;
      response += `\n${office.description}\n\n`;
    }
    
    return response;
  }
  
  // Academic Departments
  if (queryLower.includes('department') || queryLower.includes('software engineering') ||
      queryLower.includes('business') || queryLower.includes('entrepreneurship') ||
      queryLower.includes('global challenges') || queryLower.includes('leadership')) {
    
    let response = "## Academic Departments\n\n";
    
    for (const dept of academicDepartments) {
      response += `### ${dept.name}\n\n`;
      for (const faculty of dept.faculty) {
        response += `**${faculty.name}** - ${faculty.role}\n`;
        response += `Email: ${faculty.email}\n\n`;
      }
    }
    
    return response;
  }
  
  return null;
}

export default {
  missionCurators,
  belProgram,
  learningCoaches,
  administrationOffices,
  academicDepartments,
  isUniversityAdminQuery,
  processUniversityAdminQuery
};

