
import React from "react";
import { HelpCircle, FileText, GraduationCap, Receipt, AlertCircle, Mail } from "lucide-react";
import { EmailTemplateItem, Person } from "./types";

// Sample data for learning coaches
export const learningCoaches: Person[] = [
  { 
    id: 1, 
    name: "Mr. Marvin Muyonga Ogore", 
    course: "Machine Learning",
    calendarLink: "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ3IinSwaZGWuW1XZJAv7Mkiwokt8Pl_k1STcIWjMF_wXw5pzfY-SEECflnGm-2dhO7QAWFIOtcd"
  },
  { id: 2, name: "Prof. Kwame Osei", course: "Entrepreneurship" },
  { id: 3, name: "Dr. Fatima Nkosi", course: "Data Science" },
  { id: 4, name: "Prof. Thabo Mbeki", course: "African Political History" },
  { id: 5, name: "Dr. Zainab Ahmed", course: "Global Health" },
  { id: 6, name: "Prof. Nelson Mandela", course: "Social Justice" },
  { id: 7, name: "Dr. Chinua Achebe", course: "African Literature" },
  { id: 8, name: "Prof. Wangari Maathai", course: "Environmental Studies" },
  { id: 9, name: "Dr. Ngozi Okonjo-Iweala", course: "Economics" },
  { id: 10, name: "Prof. Chimamanda Adichie", course: "Creative Writing" },
  { id: 11, name: "Dr. Kofi Annan", course: "International Relations" },
  { id: 12, name: "Prof. Fred Swaniker", course: "Leadership" },
  { id: 13, name: "Dr. Stella Nkomo", course: "Business Management" },
  { id: 14, name: "Prof. Thandika Mkandawire", course: "Development Economics" },
  { id: 15, name: "Dr. Mercy Tembon", course: "Education Policy" },
  { id: 16, name: "Prof. Ali Mazrui", course: "African Politics" },
  { id: 17, name: "Dr. Nkosazana Dlamini-Zuma", course: "Public Health" },
  { id: 18, name: "Prof. Mahmood Mamdani", course: "Political Science" },
  { id: 19, name: "Dr. Akinwumi Adesina", course: "Agricultural Economics" },
  { id: 20, name: "Prof. Calestous Juma", course: "Innovation Studies" }
];

// Sample data for departments
export const departments: Person[] = [
  { 
    id: 1, 
    name: "Computer Science Department", 
    head: "Prof. Ada Obi",
    calendarLink: "https://calendar.google.com/calendar/appointments"
  },
  { 
    id: 2, 
    name: "Business School", 
    head: "Dr. James Mwangi",
    calendarLink: "https://calendar.google.com/calendar/appointments" 
  },
  { 
    id: 3, 
    name: "Global Challenges", 
    head: "Prof. Graça Machel",
    calendarLink: "https://calendar.google.com/calendar/appointments" 
  },
  { 
    id: 4, 
    name: "Entrepreneurship", 
    head: "Dr. Ashish Thakkar",
    calendarLink: "https://calendar.google.com/calendar/appointments" 
  },
  { 
    id: 5, 
    name: "Engineering", 
    head: "Prof. Venansius Baryamureeba",
    calendarLink: "https://calendar.google.com/calendar/appointments" 
  }
];

// Sample data for administration
export const administrationOffices: Person[] = [
  { 
    id: 1, 
    name: "Registrar's Office", 
    contact: "registrar@alu.edu",
    calendarLink: "https://calendar.google.com/calendar/appointments" 
  },
  { 
    id: 2, 
    name: "Financial Aid", 
    contact: "finaid@alu.edu",
    calendarLink: "https://calendar.google.com/calendar/appointments" 
  },
  { 
    id: 3, 
    name: "Student Affairs", 
    contact: "studentaffairs@alu.edu",
    calendarLink: "https://calendar.google.com/calendar/appointments" 
  },
  { 
    id: 4, 
    name: "Career Development", 
    contact: "careers@alu.edu",
    calendarLink: "https://calendar.google.com/calendar/appointments" 
  },
  { 
    id: 5, 
    name: "International Student Services", 
    contact: "international@alu.edu",
    calendarLink: "https://calendar.google.com/calendar/appointments" 
  }
];

// Sample data for human chat agents
export const chatAgents: Person[] = [
  { id: 1, name: "Sarah Kimani", department: "Student Support", status: "Online" },
  { id: 2, name: "John Okafor", department: "Technical Support", status: "Online" },
  { id: 3, name: "Amina Hassan", department: "Admissions", status: "Away" },
];

// Email inquiry departments
export const emailDepartments: Person[] = [
  { id: 1, name: "General Inquiries", email: "info@alu.edu" },
  { id: 2, name: "Admissions", email: "admissions@alu.edu" },
  { id: 3, name: "Student Affairs", email: "studentaffairs@alu.edu" },
  { id: 4, name: "Financial Aid", email: "financial.aid@alu.edu" },
  { id: 5, name: "Technical Support", email: "itsupport@alu.edu" },
];

// Email templates
export const emailTemplates: EmailTemplateItem[] = [
  {
    id: "general",
    name: "General Inquiry",
    icon: <HelpCircle size={16} />,
    subject: "General Inquiry - [Your Name]",
    body: "Dear [Department],\n\nMy name is [Your Name], a [Your Year/Program] student. I am writing to inquire about [Brief Description].\n\n[Your Question or Request]\n\nThank you for your assistance.\n\nBest regards,\n[Your Name]\n[Your Student ID]"
  },
  {
    id: "assignment",
    name: "Assignment Help",
    icon: <FileText size={16} />,
    subject: "Assignment Clarification - [Course Code]",
    body: "Dear Professor/Department,\n\nI am a student in [Course Name] (Course Code: [Course Code]). I am writing regarding the assignment due on [Due Date].\n\n[Specific Questions about Assignment]\n\nThank you for your guidance.\n\nBest regards,\n[Your Name]\n[Your Student ID]"
  },
  {
    id: "academic",
    name: "Academic Advising",
    icon: <GraduationCap size={16} />,
    subject: "Academic Advising Request - [Your Name]",
    body: "Dear Academic Advisor,\n\nI hope this email finds you well. I am [Your Name], a [Your Year/Program] student (ID: [Your Student ID]).\n\nI would like to request guidance on [Course Selection/Program Requirements/Career Planning].\n\n[Specific Details about Your Situation]\n\nWhen would be a good time to schedule a meeting to discuss this?\n\nThank you for your support.\n\nBest regards,\n[Your Name]"
  },
  {
    id: "finance",
    name: "Financial Aid",
    icon: <Receipt size={16} />,
    subject: "Financial Aid Inquiry - [Your Name]",
    body: "Dear Financial Aid Office,\n\nI am [Your Name], a [Your Year/Program] student (ID: [Your Student ID]).\n\nI am writing regarding [Scholarship/Tuition Payment/Financial Aid Application].\n\n[Specific Details about Your Financial Query]\n\nThank you for your assistance with this matter.\n\nBest regards,\n[Your Name]\n[Your Contact Information]"
  },
  {
    id: "technical",
    name: "Technical Support",
    icon: <AlertCircle size={16} />,
    subject: "Technical Support Request - [Brief Issue Description]",
    body: "Dear IT Support Team,\n\nI am experiencing technical difficulties with [System/Platform/Service].\n\nIssue Details:\n- Issue: [Brief Description]\n- When it started: [Date/Time]\n- Steps I've already taken: [Any troubleshooting steps]\n- Error messages: [Any error messages received]\n\nPlease advise on how to resolve this issue.\n\nThank you,\n[Your Name]\n[Your Student ID]\n[Your Contact Information]"
  },
  {
    id: "custom",
    name: "Custom Email",
    icon: <Mail size={16} />,
    subject: "",
    body: ""
  }
];

// Example available times
export const availableTimes = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
