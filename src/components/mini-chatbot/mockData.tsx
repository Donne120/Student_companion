
import React from "react";
import { HelpCircle, FileText, GraduationCap, Receipt, AlertCircle, Mail } from "lucide-react";
import { EmailTemplateItem, Person } from "./types";

// ALU Faculty and Learning Coaches - Complete List
export const learningCoaches: Person[] = [
  { 
    id: 1, 
    name: "Jeremiah Essuman", 
    course: "Director of Undergraduate Programmes",
    bio: "Oversees ALU undergraduate programmes; ensures experiential learning, interdisciplinary curricula, and impactful real-world education.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 2, 
    name: "Audrine Iradukunda", 
    course: "Foundation Programme Manager",
    bio: "Manages the Foundation Programme: delivery, growth, improvement; designs programmes to equip learners with skills to tackle pressing African challenges.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 3, 
    name: "Angelique Ishimwe", 
    course: "Foundation Learning Coach Senior Associate",
    bio: "Acts as facilitator/trainer/learning coach — supports students' foundational learning, helps guide and mentor them.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 4, 
    name: "Silas N. Gasasira", 
    course: "Foundation Learning Coach Associate",
    bio: "Provides mentorship, supports curriculum delivery, helps create dynamic learning experiences, student engagement.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 5, 
    name: "Seth Abimana", 
    course: "Foundation Learning Coach Coordinator",
    bio: "Coordinates foundational learning coaches; supports academic growth, fosters ethical leadership, lifelong learning.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 6, 
    name: "Mannoakgotla Medupe", 
    course: "Self-Directed Learning Skills Lab Associate",
    bio: "Mentors students in self-directed learning, supports creative skills development (e.g. graphic design, video, sound), helps students explore impact.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 7, 
    name: "Doris Maduka", 
    course: "Foundation Coach Learning Coordinator",
    bio: "Supports foundational curriculum, student facilitation, mentoring — especially for first-year foundational stage students.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 8, 
    name: "Callixte Kagabo", 
    course: "Foundation Learning Coach Coordinator",
    bio: "Facilitates degree courses, supports program development, provides academic support in foundation education; fosters self-directed learning environment.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 9, 
    name: "Rene Gitangaza", 
    course: "Foundation Learning Coach Senior Associate",
    bio: "Leads a team of learning coaches; supports students in foundational courses; fosters student development and potential.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 10, 
    name: "Innocent Mugenzi", 
    course: "Foundations Coach Senior Associate",
    bio: "Designs business/management-related modules, competency-based assessments; organizes curricula; supports academic planning.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 11, 
    name: "Raini Sydney", 
    course: "Foundations Coach Senior Associate",
    bio: "Focus: Sustainable Development, Political Economy, Climate Change — guides students with interdisciplinary lens on social/environmental systems.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 12, 
    name: "Aline Turinumukiza", 
    course: "Foundation Learning Coach Coordinator",
    bio: "Mentorship, project management, communication, youth-development, ethical leadership; supports student growth and development.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 13, 
    name: "Jennifer Umutoni", 
    course: "Self-Directed Learning Skills Lab Coordinator",
    bio: "Guides students to develop essential tech-savvy skills, fosters collaborative learning environments, supports mental well-being and inclusivity.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 14, 
    name: "Lizbeth Uwineza", 
    course: "Foundations Learning Coach Senior Associate",
    bio: "Supports communications, learning assistance; helps students succeed academically and in personal growth.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 15, 
    name: "Sylidio Masengesho", 
    course: "Foundations Coach Senior Associate",
    bio: "Designs innovative curricula, facilitates learner-centred sessions, integrates blended/competency-based learning.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 16, 
    name: "Ruth Bazing", 
    course: "Foundations Coach Senior Associate",
    bio: "Combines academic teaching and media/communications background to deliver engaging, impactful learning — fosters critical thinking, creativity.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 17, 
    name: "Ryan Johnson", 
    course: "BEL Specialisation Lead",
    bio: "Leads BEL curriculum design and delivery; brings economics & development background to shape leadership & entrepreneurship education.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 18, 
    name: "Dr. Chioma Joy Okonkwo", 
    course: "BEL Specialisation Lead",
    bio: "Focus on environmental science + leadership; guides students toward sustainable and ecological solutions — sustainable future focus.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 19, 
    name: "Mildred Kasaya Amugune", 
    course: "Specialisation Learning Coach (Business, Strategy, and Investment)",
    bio: "Coaches students in business, finance, investment — also does research (e.g. financial inclusion of rural women in Africa).",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 20, 
    name: "Claudine Ukubereyimfura", 
    course: "Specialisation Learning Coach (Policy and Advocacy)",
    bio: "Teaches policy, advocacy — international relations & global studies background; supports students interested in politics, IR, advocacy.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 21, 
    name: "Nadia Kabanyana", 
    course: "Specialisation Learning Coach (Business, Strategy, Investment)",
    bio: "Facilitates business / entrepreneurship courses; co-founded a health clinic — bridges business + community welfare + education.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 22, 
    name: "Titus Lugero", 
    course: "Specialisation Learning Coach (Business Strategy and Investment)",
    bio: "Educator, program leader, business incubator manager; mentors startups and guides course facilitation.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 23, 
    name: "Nicholas Ssekiziyivu", 
    course: "Specialisation Learning Coach (Business Strategy and Investment)",
    bio: "Focuses on business management, entrepreneurship, finance; helps students with strategy, innovation, sustainable business practices.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 24, 
    name: "Celma Costa", 
    course: "Specialisation Learning Coach (Policy and Advocacy)",
    bio: "Background in political science, media relations; teaches policy/advocacy, politics, climate change, gender issues.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 25, 
    name: "Dennis Ngobi", 
    course: "Specialisation Learning Coach (Business, Strategy, Investment)",
    bio: "Entrepreneur & educator; supports entrepreneurship & international business programs; involved in mentoring startups.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 26, 
    name: "Oreoluwa Akanni Rhoda", 
    course: "Specialisation Learning Coach (Business Strategy and Investment)",
    bio: "Focus on digital education & adult learning; supports both physical & virtual teaching, micro-credentials, modern learning methods.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 27, 
    name: "Diane Akaliza", 
    course: "Specialisation Learning Coach (Business Strategy and Investment)",
    bio: "Facilitates entrepreneurship leadership programme; focuses on inclusive learning experiences, academic advising, community learning.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 28, 
    name: "Isaro Marie Reine Kellia", 
    course: "Specialisation Learning Coach (Business Strategy and Investment)",
    bio: "Passion for education, entrepreneurship, and agriculture. Helps students combine agribusiness, entrepreneurship and social impact.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 29, 
    name: "Benita Sandrine Mulungi", 
    course: "Entrepreneurial Leaders Action Lab Senior Associate",
    bio: "Oversees E-Lab program: entrepreneurship experiments & projects, student-led ventures, innovation labs.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 30, 
    name: "Christopher Joel Mensah Hackman", 
    course: "Entrepreneurial Leaders Action Lab Associate",
    bio: "Supports entrepreneurial education, helps students exploring self-directed learning and business ventures.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 31, 
    name: "Bonita Brigitte Umurungi", 
    course: "Entrepreneurial Leaders Action Lab Coordinator",
    bio: "Coordinates E-Lab activities; works on community-driven solutions, social impact projects, mentorship for young people.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 32, 
    name: "Binusha Balachandran", 
    course: "Software Engineering (SE) Programme Manager",
    bio: "Manages the BSc Software Engineering program — ensures curriculum delivery, academic oversight, management of software-engineering education.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 33, 
    name: "Marvin Ogore", 
    course: "SE Specialisation Coach (Machine Learning)",
    bio: "Teaches ML courses, especially ML/AI for embedded systems, ML on resource-constrained devices, cloud ML deployment & reinforcement learning.",
    calendarLink: "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ3IinSwaZGWuW1XZJAv7Mkiwokt8Pl_k1STcIWjMF_wXw5pzfY-SEECflnGm-2dhO7QAWFIOtcd"
  },
  { 
    id: 34, 
    name: "Pelin Mutanguha", 
    course: "SE Specialisation Coach (Information Systems)",
    bio: "Delivers learning content for software engineering students; focuses on full-stack web development, instructional design, self-directed learning.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 35, 
    name: "Wakuma Tekalign Debela", 
    course: "SE Learning Coach",
    bio: "Web-stack teaching; helps students learn web development technologies & best practices; former DevOps engineer.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 36, 
    name: "Herve Musangwa", 
    course: "SE Learning Coach",
    bio: "Teaches Linux, version control, Python, databases, full-stack / DevOps fundamentals, system engineering; supports tech education and collaborative learning.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 37, 
    name: "Neza David Tuyishimire", 
    course: "SE Specialisation Coach",
    bio: "Experienced software engineer & data engineer; teaches software engineering, ML/AI, data engineering — supports advanced tech curriculum and research supervision.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 38, 
    name: "Carene Roxanne Umugwaneza", 
    course: "Mission Curator (Healthcare)",
    bio: "Guides students with missions in health; background in global health & healthcare management; mentors health-related projects, research, opportunities.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 39, 
    name: "Kartik Mehta", 
    course: "Mission Curator (Job Creation and Entrepreneurship)",
    bio: "Mentors students who aim to create businesses, jobs; has experience in entrepreneurship, performance management, business scaling; supports mission-based entrepreneurship.",
    calendarLink: "https://help.alueducation.com"
  }
];

// Sample data for departments
// Academic Department Faculty - Organized by specialization
export const departments: Person[] = [
  // Software Engineering Faculty
  { 
    id: 1, 
    name: "Marvin Ogore", 
    course: "Machine Learning & Data Science",
    department: "Software Engineering",
    bio: "Specializes in Machine Learning, Data Science, and AI applications. Guides students through advanced ML concepts and practical implementations.",
    calendarLink: "https://calendar.app.google/eRPvPGbvMxCJKkJj6"
  },
  { 
    id: 2, 
    name: "Pelin Mutanguha", 
    course: "Software Engineering",
    department: "Software Engineering",
    bio: "Expert in software development, system design, and engineering best practices. Mentors students in building scalable applications.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 3, 
    name: "Juma Shafara", 
    course: "Data Science & Analytics",
    department: "Software Engineering",
    bio: "Focuses on data analytics, statistical modeling, and data-driven decision making. Helps students master data science tools and techniques.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 4, 
    name: "Ange Uwase", 
    course: "Software Development",
    department: "Software Engineering",
    bio: "Teaches modern software development practices, version control, and collaborative coding. Supports students in full-stack development.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 5, 
    name: "Ange Mutoni", 
    course: "Software Engineering",
    department: "Software Engineering",
    bio: "Specializes in software architecture, design patterns, and clean code practices. Guides students in professional software development.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 6, 
    name: "Juma Shafara", 
    course: "Computer Science",
    department: "Software Engineering",
    bio: "Covers fundamental computer science concepts, algorithms, and computational thinking. Prepares students for technical challenges.",
    calendarLink: "https://help.alueducation.com"
  },
  // BEL Specialisation Faculty
  { 
    id: 7, 
    name: "Fidele Rutabingwa", 
    course: "Entrepreneurship & Innovation",
    department: "BEL Specialisation",
    bio: "Entrepreneurship expert with focus on startup creation, business model innovation, and venture development.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 8, 
    name: "Innocent Mugenzi", 
    course: "Business Management",
    department: "BEL Specialisation",
    bio: "Specializes in business strategy, operations management, and organizational leadership.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 9, 
    name: "Raini Sydney", 
    course: "Sustainable Development & Climate",
    department: "BEL Specialisation",
    bio: "Expert in sustainable development, climate change policy, and environmental economics.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 10, 
    name: "Sevika Varaden Reetoo", 
    course: "Climate Change & Sustainability",
    department: "BEL Specialisation",
    bio: "Climate action specialist with UN experience in renewable energy and reef restoration projects.",
    calendarLink: "https://calendar.app.google/aUYL6assM7VNA7WS7"
  },
  // Foundation Programme Faculty
  { 
    id: 11, 
    name: "Jeremiah Essuman", 
    course: "Director of Undergraduate Programmes",
    department: "Foundation Programme",
    bio: "Oversees all undergraduate programmes, ensuring experiential learning and impactful education.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 12, 
    name: "Audrine Iradukunda", 
    course: "Foundation Programme Manager",
    department: "Foundation Programme",
    bio: "Manages Foundation Programme delivery, growth, and continuous improvement.",
    calendarLink: "https://help.alueducation.com"
  },
  // E-Lab Faculty
  { 
    id: 13, 
    name: "Mannoakgotla Medupe", 
    course: "Creative Skills & Design",
    department: "E-Lab",
    bio: "Mentors students in graphic design, video production, sound engineering, and creative expression.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 14, 
    name: "Jennifer Umutoni", 
    course: "Self-Directed Learning",
    department: "E-Lab",
    bio: "Guides students in developing tech-savvy skills, collaborative learning, and mental well-being.",
    calendarLink: "https://help.alueducation.com"
  },
  { 
    id: 15, 
    name: "Sibongile Musundwa", 
    course: "Arts, Culture & Design",
    department: "E-Lab",
    bio: "Cultural worker specializing in arts management, creative projects, and cultural diplomacy.",
    calendarLink: "https://calendar.app.google/6hMsRRQXPkNrzFhJA"
  }
];

// Sample data for administration
export const administrationOffices: Person[] = [
  { 
    id: 1, 
    name: "Admissions Office", 
    contact: "admissions@alueducation.com",
    calendarLink: "https://help.alueducation.com",
    bio: "Handles all admissions inquiries, application processes, and enrollment information for prospective students."
  },
  { 
    id: 2, 
    name: "Registrar's Office", 
    contact: "registrar@alueducation.com",
    calendarLink: "https://help.alueducation.com",
    bio: "Manages student records, transcripts, enrollment verification, and academic documentation."
  },
  { 
    id: 3, 
    name: "Financial Aid Office", 
    contact: "financial.aid@alueducation.com",
    calendarLink: "https://help.alueducation.com",
    bio: "Provides support for scholarships, grants, payment plans, and financial assistance programs."
  },
  { 
    id: 4, 
    name: "Student Affairs", 
    contact: "studentaffairs@alueducation.com",
    calendarLink: "https://help.alueducation.com",
    bio: "Supports student life, campus activities, student organizations, and overall student well-being."
  },
  { 
    id: 5, 
    name: "Career Development", 
    contact: "careers@alueducation.com",
    calendarLink: "https://help.alueducation.com",
    bio: "Assists with career planning, internships, job placements, and professional development."
  },
  { 
    id: 6, 
    name: "International Student Services", 
    contact: "international@alueducation.com",
    calendarLink: "https://help.alueducation.com",
    bio: "Provides support for international students including visa assistance, cultural integration, and travel documentation."
  },
  { 
    id: 7, 
    name: "IT Support", 
    contact: "itsupport@alueducation.com",
    calendarLink: "https://help.alueducation.com",
    bio: "Technical support for campus systems, learning platforms, email, and technology-related issues."
  }
];

// Mission Curators Contact Information
export const missionCurators: Person[] = [
  {
    id: 1,
    name: "Fred Nkubito",
    missionArea: "Urbanization & Infrastructure",
    email: "fnkubito@alueducation.com",
    calendarLink: "https://calendar.app.google/ND451LWXxbJ7N4Wq9"
  },
  {
    id: 2,
    name: "Kagenza Rumongi",
    missionArea: "Governance",
    email: "krumongi@alueducation.com",
    calendarLink: "https://calendly.com/kagenzar",
    bio: "I am Kagenza Sakufi Rumongi, from Rwanda and recently joined ALU as the Governance Mission Curator and Adjunct Faculty teaching Governance Seminar and Comparative Politics in Africa. My life mission is to contribute to the transformation of Africa through public service, and through leadership development through academia and one-on-one mentorship. My professional background is in Civil Society, Diplomacy, and Entrepreneurship. My academic background is in International Relations. If you are interested in African Politics, Pan Africanism, Public Service, IR, Leadership Development, let's link up!"
  },
  {
    id: 3,
    name: "Elizabeth Ndinda",
    missionArea: "Education",
    email: "endinda@alueducation.com",
    contact: "Office hours available on request"
  },
  {
    id: 4,
    name: "Sevika Varaden Reetoo",
    missionArea: "Climate Change",
    email: "sreetoo@alueducation.com",
    calendarLink: "https://calendar.app.google/aUYL6assM7VNA7WS7",
    bio: "I am Sevika Varaden Reetoo, and for the past five years, I have worked for the United Nations Development Programme, in the implementation of a national project aimed at scaling up the renewable power generation in Mauritius and in a regional project aimed at restoring degraded reefs in the Indian Ocean. My postgraduate degrees in Business have allowed me to understand the bigger strategic picture and contribute to climate action. Let's discuss about how to protect our societies and countries from the effects of climate change!"
  },
  {
    id: 5,
    name: "Sibongile Musundwa",
    missionArea: "Arts, Culture & Design",
    email: "smusundwa@alueducation.com",
    calendarLink: "https://calendar.app.google/6hMsRRQXPkNrzFhJA",
    bio: "I am Sibongile Musundwa and these days I consider myself a cultural worker without specialisation. I have worked in cultural diplomacy as an arts project manager, been the director of a small not-for-profit creative hub, been a board member for a national museum, created small online and podcast projects of my own, and in my earlier days I was a radio show host & music manager at my campus radio station while being a reluctant Economics student! I am a fan of things that make our world beautiful and full of meaning and wonder. Let's explore: Audio-visual and interactive media / Books and Press / Design and creative services / Performance and celebration / Visual arts and crafts / Museums and heritage preservation & much more."
  },
  {
    id: 6,
    name: "Bosede Funmi Akinbolusere",
    missionArea: "Women Empowerment & Gender Equality",
    email: "bakinbolusere@alueducation.com",
    bio: "I am Bosede Funmi Akinbolusere, a social entrepreneur working with and for women and young people and in the last 6 years I have been working with populations in humanitarian settings. My Bachelor in Agricultural Economics and Masters' in Gender Analysis & Economics coupled with many years working as a Sexual Reproductive Health & Rights advocate has further enhanced my skills in promoting diversity, equity and inclusion which are the hearts of Sustainable Development. I am your Mission Curator - Gender Equality & Women Empowerment, together let's deconstruct gender."
  },
  {
    id: 7,
    name: "Brian Nicholas Neza",
    missionArea: "Agriculture",
    email: "bneza@alueducation.com",
    calendarLink: "https://sites.google.com/alueducation.com/aluknowledgemanagementportal/g-c-g-o/agriculture?authuser=0#h.4hyangxnbbcr"
  }
];

// BEL Program Office Hours
export const belProgram: Person[] = [
  {
    id: 1,
    name: "Arnaud Michel Nibaruta",
    department: "BEL Manager",
    email: "anibaruta@alueducation.com",
    calendarLink: "https://calendar.app.google/5js5KrCpeonqMfQN8"
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
  { id: 1, name: "General Inquiries", email: "info@alueducation.com" },
  { id: 2, name: "Admissions", email: "admissions@alueducation.com" },
  { id: 3, name: "Student Affairs", email: "studentaffairs@alueducation.com" },
  { id: 4, name: "Financial Aid", email: "financial.aid@alueducation.com" },
  { id: 5, name: "Technical Support", email: "itsupport@alueducation.com" },
  { id: 6, name: "Registrar's Office", email: "registrar@alueducation.com" },
  { id: 7, name: "Career Development", email: "careers@alueducation.com" },
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
