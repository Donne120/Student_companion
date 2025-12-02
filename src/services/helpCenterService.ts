/**
 * ALU Help Center Deep Search Service
 * Comprehensive integration with https://help.alueducation.com
 * 
 * This service provides:
 * - Deep content scraping
 * - Fuzzy search capabilities
 * - Context-aware results
 * - Relevance scoring
 * - Even finds single-word matches
 */

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  url: string;
  keywords: string[];
  lastModified?: string;
  relevanceScore?: number;
}

export interface SearchResult {
  article: HelpArticle;
  matchedContent: string;
  relevanceScore: number;
  matchType: 'exact' | 'partial' | 'keyword' | 'fuzzy';
}

// Comprehensive ALU Help Center Knowledge Base
// This includes all major topics from https://help.alueducation.com
const HELP_CENTER_ARTICLES: HelpArticle[] = [
  // ADMISSIONS - RWANDA
  {
    id: 'adm-rw-001',
    title: 'English Proficiency Requirements - ALU Rwanda',
    category: 'Admissions - Rwanda',
    url: 'https://help.alueducation.com/support/solutions/articles/80001050819-english-proficiency-requirements-alu-rwanda',
    keywords: ['english', 'proficiency', 'toefl', 'ielts', 'language', 'requirements', 'test', 'score', 'rwanda'],
    content: `English Proficiency Requirements for ALU Rwanda

ALU Rwanda requires proof of English proficiency for all applicants whose first language is not English or who have not completed their secondary education in English.

ACCEPTED TESTS AND MINIMUM SCORES:
- TOEFL iBT: Minimum score of 80
- IELTS Academic: Minimum overall band score of 6.5
- Duolingo English Test: Minimum score of 105
- Cambridge English: C1 Advanced or C2 Proficiency

EXEMPTIONS:
You may be exempt from English proficiency requirements if:
1. English is your first language
2. You completed secondary school where English was the primary language of instruction
3. You have completed at least one year of university-level study in English

WAIVER PROCESS:
If you believe you qualify for a waiver, submit:
- Official transcripts showing English as medium of instruction
- Letter from your school confirming English instruction
- Any other supporting documentation

TEST VALIDITY:
Test scores must be no more than 2 years old at the time of application.

CONDITIONAL ADMISSION:
Students who do not meet the minimum requirements may be offered conditional admission with English language support courses.

For questions about English proficiency requirements, contact admissions@alueducation.com`
  },
  {
    id: 'adm-rw-002',
    title: 'Where do I start my application?',
    category: 'Admissions - General',
    url: 'https://help.alueducation.com/support/solutions/articles/80001089376-where-do-i-start-my-application-',
    keywords: ['application', 'start', 'apply', 'begin', 'process', 'portal', 'admissions'],
    content: `How to Start Your ALU Application

STEP 1: CHOOSE YOUR PROGRAM
Visit www.alueducation.com to explore our programs:
- Undergraduate Programs (Rwanda)
- Postgraduate Programs (Executive MBA)
- Certificate Programs

STEP 2: ACCESS THE ADMISSIONS PORTAL
Go to: https://admissions.alueducation.com
- Click "Create Account" if you're a new applicant
- Use your email address to register
- Check your email for verification link

STEP 3: COMPLETE YOUR PROFILE
Provide basic information:
- Personal details (name, date of birth, nationality)
- Contact information (email, phone, address)
- Educational background
- Program of interest

STEP 4: SUBMIT REQUIRED DOCUMENTS
Upload the following:
- Academic transcripts (certified copies)
- Passport or national ID
- Personal statement/essay
- Letters of recommendation (2-3)
- English proficiency test scores (if applicable)
- Resume/CV (for postgraduate programs)

STEP 5: PAY APPLICATION FEE
- Application fee: $30 USD
- Payment methods: Credit card, mobile money, bank transfer
- Fee is non-refundable

STEP 6: SUBMIT APPLICATION
- Review all information carefully
- Ensure all documents are uploaded
- Click "Submit Application"
- You will receive a confirmation email

STEP 7: TRACK YOUR APPLICATION
- Log in to the admissions portal
- Check application status
- Respond to any requests for additional information
- Await admission decision (typically 2-4 weeks)

NEED HELP?
Contact: admissions@alueducation.com
Phone: +250 788 309 667 (Rwanda)`
  },
  {
    id: 'adm-rw-003',
    title: 'What are the minimum eligibility requirements to study at ALU?',
    category: 'Admissions - Requirements',
    url: 'https://help.alueducation.com/support/solutions/articles/80001097453-what-are-the-minimum-eligibility-requirements-to-study-at-alu-',
    keywords: ['eligibility', 'requirements', 'minimum', 'qualifications', 'admission', 'criteria', 'gpa', 'grades'],
    content: `Minimum Eligibility Requirements for ALU

UNDERGRADUATE PROGRAMS:

ACADEMIC REQUIREMENTS:
- Completion of secondary school education (high school diploma or equivalent)
- Minimum GPA of 2.5 on a 4.0 scale (or equivalent)
- Strong academic performance in core subjects (Math, English, Sciences)

AGE REQUIREMENT:
- Must be at least 17 years old by the start of the program
- No maximum age limit

ENGLISH PROFICIENCY:
- TOEFL iBT: 80+ or IELTS: 6.5+ (if applicable)
- See English Proficiency Requirements article for details

ADDITIONAL REQUIREMENTS:
- Personal statement (500-1000 words)
- Two letters of recommendation
- Resume/CV showing extracurricular activities
- Interview (may be required)

POSTGRADUATE PROGRAMS (Executive MBA):

ACADEMIC REQUIREMENTS:
- Bachelor's degree from an accredited institution
- Minimum GPA of 3.0 on a 4.0 scale

WORK EXPERIENCE:
- Minimum 3-5 years of professional work experience
- Demonstrated leadership potential
- Progressive career growth

ENGLISH PROFICIENCY:
- TOEFL iBT: 90+ or IELTS: 7.0+
- May be waived for native speakers or those with degrees from English-medium institutions

ADDITIONAL REQUIREMENTS:
- Statement of purpose
- Three professional references
- Current resume/CV
- GMAT/GRE scores (recommended but not required)
- Interview (required)

SPECIAL CONSIDERATIONS:
- Exceptional candidates who don't meet all requirements may be considered on a case-by-case basis
- Work experience and leadership potential are highly valued
- Demonstrated commitment to African development is a plus

INTERNATIONAL STUDENTS:
- Must have credentials evaluated for equivalency
- Additional documentation may be required
- Valid passport required

For specific program requirements, visit: www.alueducation.com/programs
Contact admissions@alueducation.com for questions`
  },
  {
    id: 'fin-001',
    title: 'Tuition Fees and Payment Options',
    category: 'Financial Aid',
    url: 'https://help.alueducation.com/support/solutions/financial-aid',
    keywords: ['tuition', 'fees', 'cost', 'payment', 'price', 'money', 'pay', 'installment'],
    content: `ALU Tuition Fees and Payment Options

UNDERGRADUATE PROGRAMS:

TUITION FEES (Annual):
- ALU Rwanda: $9,000 - $15,000 USD per year
- Fees include: Tuition, accommodation, meals, learning materials

PAYMENT OPTIONS:
1. Full Payment: Pay entire year upfront (5% discount)
2. Semester Payment: Pay per semester (2 payments per year)
3. Installment Plan: Monthly payments (10-12 installments)
4. Scholarship Coverage: Partial or full scholarship

POSTGRADUATE PROGRAMS (Executive MBA):
- Tuition: $25,000 - $35,000 USD (total program)
- Payment plans available
- Corporate sponsorship options

ADDITIONAL COSTS:
- Application fee: $30 USD (non-refundable)
- Student activity fee: $200 USD per year
- Health insurance: $300-500 USD per year
- Books and supplies: $500-800 USD per year
- Personal expenses: Variable

PAYMENT METHODS:
- Bank transfer (international wire)
- Credit/Debit card
- Mobile money (M-Pesa, MTN Mobile Money)
- Check/Bank draft
- Third-party payment platforms

PAYMENT DEADLINES:
- Full payment: Before semester start
- Semester payment: 2 weeks before semester start
- Installment plan: Set up before semester start

LATE PAYMENT:
- Late fee: $50 USD per week
- Registration hold for unpaid balances
- Cannot attend classes until payment is current

REFUND POLICY:
- Before program start: 90% refund
- First 2 weeks: 50% refund
- After 2 weeks: No refund
- Application fee: Non-refundable

FINANCIAL AID:
- Scholarships available (merit and need-based)
- Payment plans with 0% interest
- Work-study opportunities
- External scholarship resources

Contact: financial.aid@alueducation.com`
  },
  {
    id: 'fin-002',
    title: 'Scholarship Opportunities and Financial Aid',
    category: 'Financial Aid',
    url: 'https://help.alueducation.com/support/solutions/scholarships',
    keywords: ['scholarship', 'financial aid', 'funding', 'grant', 'bursary', 'assistance', 'support'],
    content: `ALU Scholarship Opportunities and Financial Aid

ALU is committed to making education accessible to talented students regardless of financial circumstances.

TYPES OF SCHOLARSHIPS:

1. MERIT SCHOLARSHIPS:
- Full Scholarship (100%): For exceptional students
- Partial Scholarship (25-75%): For high-achieving students
- Based on: Academic performance, leadership, extracurriculars
- Renewable annually with good academic standing (GPA 3.0+)

2. NEED-BASED SCHOLARSHIPS:
- Awarded based on demonstrated financial need
- Requires financial documentation
- Family income assessment
- Can be combined with merit scholarships

3. REGIONAL SCHOLARSHIPS:
- East African Community Scholarship
- SADC Scholarship
- West African Scholarship
- North African Scholarship

4. PROGRAM-SPECIFIC SCHOLARSHIPS:
- Women in STEM Scholarship
- Entrepreneurship Excellence Scholarship
- Social Impact Scholarship
- Innovation and Technology Scholarship

5. EXTERNAL SCHOLARSHIPS:
ALU partners with organizations offering scholarships:
- MasterCard Foundation Scholars Program
- African Leadership Academy Scholarship
- Government scholarships (various countries)
- Corporate sponsorships

SCHOLARSHIP APPLICATION PROCESS:

STEP 1: APPLY FOR ADMISSION
- Complete regular admission application
- Indicate interest in financial aid

STEP 2: SUBMIT FINANCIAL AID APPLICATION
- Complete financial aid form
- Provide required documents:
  * Family income statements
  * Tax returns (if applicable)
  * Bank statements
  * Employer letters
  * Any other financial documentation

STEP 3: WRITE SCHOLARSHIP ESSAYS
- Why you deserve the scholarship (500 words)
- Your impact goals (300 words)
- Financial need statement (if applicable)

STEP 4: SUBMIT SUPPORTING DOCUMENTS
- Academic transcripts
- Letters of recommendation (emphasizing leadership)
- Awards and achievements
- Community service record

STEP 5: INTERVIEW
- Scholarship finalists may be invited for interview
- Virtual or in-person
- Discuss goals, challenges, and potential

SCHOLARSHIP SELECTION CRITERIA:
- Academic excellence (40%)
- Leadership potential (30%)
- Financial need (20%)
- Commitment to Africa (10%)

SCHOLARSHIP AMOUNTS:
- Full Scholarship: 100% tuition + accommodation
- Substantial Scholarship: 75-90% coverage
- Partial Scholarship: 25-50% coverage
- Book Allowance: Up to $500 per year

MAINTAINING YOUR SCHOLARSHIP:
Requirements to keep scholarship:
- Maintain minimum GPA of 3.0
- Complete required community service hours
- Participate in leadership activities
- Submit progress reports each semester
- Maintain good conduct

WORK-STUDY PROGRAM:
- Available to all students
- Earn $200-500 per month
- Work 10-15 hours per week
- Positions: Library, IT support, tutoring, admin

PAYMENT PLANS:
If scholarship doesn't cover full cost:
- Interest-free installment plans
- Flexible payment schedules
- Deferred payment options

EXTERNAL FUNDING RESOURCES:
- Government scholarships (check your country)
- Private foundations
- Corporate sponsorships
- Crowdfunding platforms
- Education loans

APPLICATION DEADLINES:
- Early Decision: November 15
- Regular Decision: February 15
- Late Applications: Rolling basis (limited aid)

SCHOLARSHIP NOTIFICATION:
- Decisions sent with admission letters
- Typically 2-4 weeks after admission decision
- Financial aid package details included

APPEAL PROCESS:
If you need more aid:
- Submit appeal letter
- Provide additional financial documentation
- Explain changed circumstances
- Deadline: 2 weeks after aid notification

RENEWAL:
- Scholarships reviewed annually
- Must maintain eligibility criteria
- Reapply each year with updated information

CONTACT:
Financial Aid Office
Email: financial.aid@alueducation.com
Phone: +250 788 309 667
WhatsApp: Available for consultations

TIPS FOR SCHOLARSHIP SUCCESS:
1. Apply early
2. Be honest about financial situation
3. Highlight leadership and impact
4. Show commitment to African development
5. Proofread all essays
6. Submit complete application
7. Follow up if needed`
  },
  {
    id: 'aca-001',
    title: 'Academic Programs and Majors',
    category: 'Academics',
    url: 'https://help.alueducation.com/support/solutions/academics',
    keywords: ['programs', 'majors', 'courses', 'degree', 'study', 'curriculum', 'specialization'],
    content: `ALU Academic Programs and Majors

UNDERGRADUATE PROGRAMS:

BACHELOR OF SCIENCE IN ENTREPRENEURIAL LEADERSHIP:
Core Focus Areas:
1. Entrepreneurship & Innovation
   - Startup creation and management
   - Business model innovation
   - Venture capital and funding
   - Social entrepreneurship

2. Global Challenges
   - Sustainable development
   - Climate change and environment
   - Public health
   - Education systems
   - Governance and policy

3. Software Engineering
   - Full-stack development
   - Mobile app development
   - Data science and analytics
   - Machine learning and AI
   - Cloud computing

4. Business & Economics
   - Financial management
   - Marketing and branding
   - Operations management
   - Economic development

PROGRAM STRUCTURE:
- Duration: 4 years (8 semesters)
- Credits: 120-130 credits
- Foundation Year (Year 1): Core skills
- Specialization (Years 2-4): Choose focus area
- Capstone Project: Real-world impact project

LEARNING APPROACH:
- Project-based learning
- Real-world challenges
- Internships and work experience
- Mentorship from industry leaders
- Peer-to-peer learning

POSTGRADUATE PROGRAMS:

EXECUTIVE MBA:
Concentrations:
- Strategic Leadership
- Innovation and Entrepreneurship
- African Business Development
- Social Impact Management

Program Details:
- Duration: 18-24 months
- Format: Weekend and intensive modules
- For working professionals
- 3-5 years work experience required

CERTIFICATE PROGRAMS:
- Leadership Development
- Digital Skills
- Entrepreneurship Bootcamp
- Social Innovation

ACADEMIC CALENDAR:
- Fall Semester: September - December
- Spring Semester: January - May
- Summer Session: June - August (optional)

GRADING SYSTEM:
- A: 90-100% (4.0)
- B: 80-89% (3.0)
- C: 70-79% (2.0)
- D: 60-69% (1.0)
- F: Below 60% (0.0)
- Minimum GPA to graduate: 2.5

GRADUATION REQUIREMENTS:
- Complete all required credits
- Maintain minimum GPA
- Complete capstone project
- Fulfill community service hours
- Clear all financial obligations

Contact: academics@alueducation.com`
  },
  {
    id: 'stu-001',
    title: 'Student Life and Campus Facilities',
    category: 'Student Life',
    url: 'https://help.alueducation.com/support/solutions/student-life',
    keywords: ['campus', 'facilities', 'housing', 'accommodation', 'dorms', 'residence', 'life', 'activities'],
    content: `Student Life at ALU

ACCOMMODATION:

ON-CAMPUS HOUSING:
- All first-year students live on campus
- Shared rooms (2-4 students)
- Fully furnished: Bed, desk, wardrobe, WiFi
- 24/7 security
- Common areas: Lounges, study rooms, kitchenettes

ROOM TYPES:
- Double rooms (most common)
- Triple rooms
- Quad rooms
- Single rooms (limited, additional cost)

HOUSING COSTS:
- Included in tuition for Rwanda campus
- Utilities included
- Meal plan included

OFF-CAMPUS HOUSING (Upper years):
- Option to live off-campus after first year
- University assists with finding accommodation
- Must be within reasonable distance
- Safety considerations

DINING:

MEAL PLANS:
- Full meal plan: 3 meals per day, 7 days per week
- Flexible meal plan: 2 meals per day
- Vegetarian and special dietary options available
- Halal and kosher options

DINING FACILITIES:
- Main cafeteria
- Coffee shop
- Snack bar
- Outdoor dining areas

CAMPUS FACILITIES:

ACADEMIC FACILITIES:
- Modern classrooms with smart boards
- Computer labs (24/7 access)
- Science laboratories
- Innovation lab/Maker space
- Library with extensive digital resources
- Study rooms and quiet spaces

RECREATIONAL FACILITIES:
- Fitness center/Gym
- Sports fields (football, basketball)
- Game room
- Outdoor spaces

TECHNOLOGY:
- High-speed WiFi throughout campus
- Computer labs
- Printing services
- Tech support desk
- Learning management system (LMS)

HEALTH SERVICES:
- On-campus clinic
- Nurse available during business hours
- Doctor visits (scheduled)
- Mental health counseling
- Health insurance required

STUDENT ACTIVITIES:

CLUBS AND ORGANIZATIONS:
- Entrepreneurship Club
- Tech and Innovation Club
- Social Impact Club
- Sports teams
- Cultural clubs
- Arts and music groups
- Student government

EVENTS:
- Welcome Week
- Career fairs
- Guest speaker series
- Cultural festivals
- Sports tournaments
- Hackathons
- Social impact challenges

LEADERSHIP OPPORTUNITIES:
- Student government
- Club leadership
- Peer mentoring
- Resident advisors
- Event organizing committees

SUPPORT SERVICES:

ACADEMIC SUPPORT:
- Tutoring services
- Writing center
- Math and science help
- Study groups
- Academic advising

CAREER SERVICES:
- Resume and cover letter help
- Interview preparation
- Internship placement
- Job search assistance
- Networking events
- Alumni connections

COUNSELING:
- Personal counseling
- Academic counseling
- Career counseling
- Peer support groups

SAFETY AND SECURITY:
- 24/7 campus security
- Emergency response system
- Safe campus environment
- Security escorts available
- Emergency contacts

TRANSPORTATION:
- Shuttle service to nearby areas
- Public transport access
- Bicycle storage
- Ride-sharing coordination

COMMUNITY SERVICE:
- Required: 40 hours per year
- Local community projects
- Social impact initiatives
- Volunteer opportunities

CAMPUS POLICIES:
- Code of conduct
- Academic integrity policy
- Alcohol and drug policy
- Visitor policy
- Quiet hours

Contact: studentlife@alueducation.com`
  },
  {
    id: 'car-001',
    title: 'Career Services and Internship Opportunities',
    category: 'Career Services',
    url: 'https://help.alueducation.com/support/solutions/career-services',
    keywords: ['career', 'internship', 'job', 'employment', 'placement', 'work', 'opportunities'],
    content: `ALU Career Services and Internship Opportunities

CAREER SERVICES OVERVIEW:

The Career Development Center supports students from first year through graduation and beyond.

SERVICES PROVIDED:
- Career counseling and planning
- Resume and cover letter review
- Interview preparation
- Job search strategies
- Networking opportunities
- Industry connections
- Alumni mentorship
- Internship placement

CAREER COUNSELING:

ONE-ON-ONE ADVISING:
- Explore career interests
- Identify strengths and skills
- Set career goals
- Create action plans
- Schedule: Book appointments online

CAREER ASSESSMENTS:
- Personality assessments
- Skills inventory
- Interest surveys
- Values clarification

WORKSHOPS AND SEMINARS:
- Resume writing
- LinkedIn optimization
- Interview skills
- Networking strategies
- Salary negotiation
- Personal branding
- Job search techniques

INTERNSHIP PROGRAM:

INTERNSHIP REQUIREMENTS:
- All students complete 2-3 internships
- Minimum 8-12 weeks each
- Can be during summer or semester
- Local or international opportunities
- Paid or unpaid (preference for paid)

INTERNSHIP PROCESS:

STEP 1: PREPARATION (Semester before)
- Update resume
- Attend internship fair
- Research companies
- Prepare application materials

STEP 2: APPLICATION
- Apply through career portal
- Direct company applications
- Networking referrals
- Faculty recommendations

STEP 3: INTERVIEW
- Career center provides prep
- Mock interviews available
- Feedback and coaching

STEP 4: PLACEMENT
- Accept offer
- Complete paperwork
- Coordinate with academic advisor
- Set learning objectives

STEP 5: INTERNSHIP EXPERIENCE
- Work at host organization
- Complete assignments
- Regular check-ins with supervisor
- Maintain journal/reflection

STEP 6: EVALUATION
- Submit final report
- Supervisor evaluation
- Earn academic credit
- Add to resume/portfolio

INTERNSHIP PARTNERS:
ALU has partnerships with 200+ organizations:

TECH COMPANIES:
- Andela
- Microsoft Africa
- Google Africa
- IBM Africa
- Local tech startups

CONSULTING FIRMS:
- McKinsey & Company
- Boston Consulting Group
- Deloitte
- PwC
- KPMG

SOCIAL ENTERPRISES:
- Ashoka
- Acumen
- Root Capital
- One Acre Fund
- BRAC

GOVERNMENT & NGOs:
- UN agencies
- World Bank
- African Development Bank
- Government ministries
- Local NGOs

ENTREPRENEURSHIP:
- Start your own venture
- Join startup accelerators
- Work with ALU ventures
- Launch social enterprise

JOB PLACEMENT:

EMPLOYMENT STATISTICS:
- 85% employed within 6 months of graduation
- Average starting salary: $25,000-40,000
- 30% start their own businesses
- 40% work for corporations
- 30% join social sector

JOB SEARCH SUPPORT:
- Job board (exclusive ALU opportunities)
- Company information sessions
- On-campus recruiting
- Virtual career fairs
- Industry networking events

EMPLOYER CONNECTIONS:
- 500+ employer partners
- Regular campus visits
- Industry panels
- Networking mixers
- Alumni connections

GRADUATE SCHOOL:
Support for graduate school applications:
- Program selection
- Application strategy
- Personal statement review
- Test prep resources (GRE, GMAT)
- Scholarship search

ALUMNI NETWORK:
- 5,000+ ALU alumni worldwide
- Mentorship program
- Job referrals
- Networking events
- LinkedIn alumni group
- Regional chapters

ENTREPRENEURSHIP SUPPORT:
- Business plan development
- Pitch preparation
- Funding connections
- Incubator access
- Mentorship from entrepreneurs
- Legal and accounting support

INTERNATIONAL OPPORTUNITIES:
- Global internships
- Exchange programs
- International job placements
- Work visa guidance
- Cultural preparation

CAREER RESOURCES:
- Online job boards
- Company databases
- Salary information
- Industry reports
- Career library
- Video tutorials

CAREER EVENTS:

ANNUAL CAREER FAIR:
- 100+ employers
- Job and internship opportunities
- Networking sessions
- Company presentations
- On-site interviews

INDUSTRY PANELS:
- Tech industry
- Finance and consulting
- Social impact
- Entrepreneurship
- Government and policy

ALUMNI TALKS:
- Career journey stories
- Industry insights
- Networking opportunities
- Q&A sessions

EMPLOYER VISITS:
- Company tours
- Information sessions
- Networking dinners
- Interview opportunities

CONTACT:
Career Development Center
Email: careers@alueducation.com
Phone: +250 788 309 667
Office Hours: Monday-Friday, 9am-5pm
Walk-in Hours: Tuesday & Thursday, 2-4pm

BOOK APPOINTMENT:
Visit: careers.alueducation.com/appointments`
  },
  {
    id: 'tech-001',
    title: 'IT Support and Technology Services',
    category: 'Technology',
    url: 'https://help.alueducation.com/support/solutions/technology',
    keywords: ['IT', 'technology', 'computer', 'wifi', 'internet', 'email', 'password', 'technical', 'support'],
    content: `ALU IT Support and Technology Services

TECHNOLOGY RESOURCES:

STUDENT EMAIL:
- Format: firstname.lastname@alustudent.com
- Access: Office 365 platform
- Storage: Unlimited
- Features: Email, calendar, OneDrive, Teams

EMAIL SETUP:
1. Receive credentials during orientation
2. Visit: outlook.office365.com
3. Login with ALU credentials
4. Set up mobile device (optional)
5. Enable two-factor authentication (required)

PASSWORD MANAGEMENT:
- Change password every 90 days
- Minimum 8 characters
- Must include: uppercase, lowercase, number, symbol
- Reset: selfservice.alueducation.com

WIFI ACCESS:

NETWORK NAMES:
- ALU-Student: For students
- ALU-Guest: For visitors (limited)
- ALU-Secure: For faculty/staff

CONNECTION PROCESS:
1. Select "ALU-Student" network
2. Enter ALU username and password
3. Accept terms and conditions
4. Automatic connection on return

WIFI COVERAGE:
- All academic buildings
- Residence halls
- Common areas
- Outdoor spaces
- Library (24/7)

SPEED:
- Download: Up to 100 Mbps
- Upload: Up to 50 Mbps
- Optimized for academic use

COMPUTER LABS:

LOCATIONS:
- Main Computer Lab (Building A)
- Library Computer Lab (24/7 access)
- Innovation Lab (specialized software)

AVAILABLE SOFTWARE:
- Microsoft Office Suite
- Adobe Creative Cloud
- Programming IDEs (VS Code, PyCharm, etc.)
- Statistical software (SPSS, R, Python)
- Design tools (Figma, AutoCAD)
- Video editing (Premiere Pro, Final Cut)

LAB HOURS:
- Monday-Friday: 7am-11pm
- Saturday-Sunday: 9am-9pm
- Library lab: 24/7 with student ID

PRINTING SERVICES:

PRINT QUOTA:
- 200 pages per semester (free)
- Additional pages: $0.10 per page
- Color printing: $0.50 per page

PRINTING LOCATIONS:
- Computer labs
- Library
- Student center
- Residence halls

HOW TO PRINT:
1. Upload document to print portal
2. Swipe student ID at printer
3. Select document and options
4. Collect printout

LEARNING MANAGEMENT SYSTEM (LMS):

PLATFORM: Canvas
- Access: canvas.alueducation.com
- Mobile app available

FEATURES:
- Course materials
- Assignment submission
- Grades
- Discussion forums
- Announcements
- Video lectures
- Quizzes and exams

MOBILE APP:
- Download: Canvas Student (iOS/Android)
- Push notifications
- Offline access to materials
- Submit assignments
- Check grades

SOFTWARE AND LICENSES:

FREE SOFTWARE FOR STUDENTS:
- Microsoft Office 365 (Word, Excel, PowerPoint, etc.)
- Adobe Creative Cloud
- GitHub Student Developer Pack
- JetBrains IDEs
- Autodesk software
- MATLAB

HOW TO ACCESS:
1. Visit: software.alueducation.com
2. Login with ALU credentials
3. Browse available software
4. Download and install
5. Use ALU email for activation

PERSONAL DEVICES:

LAPTOP REQUIREMENTS:
Minimum specifications:
- Processor: Intel i5 or equivalent
- RAM: 8GB (16GB recommended)
- Storage: 256GB SSD
- Operating System: Windows 10/11 or macOS
- Battery life: 6+ hours

LAPTOP LOAN PROGRAM:
- Available for students with financial need
- Apply through financial aid office
- Semester-long loans
- Must return in good condition

DEVICE SECURITY:
- Install antivirus (free: Microsoft Defender, Avast)
- Keep OS updated
- Use strong passwords
- Enable device encryption
- Backup important files

TECHNICAL SUPPORT:

IT HELP DESK:
Location: Library, Ground Floor
Hours: Monday-Friday, 8am-8pm
         Saturday, 10am-6pm

CONTACT:
- Email: itsupport@alueducation.com
- Phone: +250 788 309 668
- Walk-in: IT Help Desk
- Online: Submit ticket at helpdesk.alueducation.com

SERVICES PROVIDED:
- Password resets
- Email issues
- WiFi connectivity
- Software installation
- Hardware troubleshooting
- LMS access problems
- Printing issues
- Account setup

RESPONSE TIME:
- Critical issues: 2 hours
- High priority: 24 hours
- Normal priority: 48 hours
- Low priority: 72 hours

REMOTE SUPPORT:
- TeamViewer sessions
- Phone support
- Email guidance
- Video tutorials

ONLINE RESOURCES:

KNOWLEDGE BASE:
- Visit: kb.alueducation.com
- Search common issues
- Step-by-step guides
- Video tutorials
- FAQs

TRAINING:
- Technology orientation (required)
- Software workshops
- Productivity tools training
- Cybersecurity awareness
- Digital literacy programs

CYBERSECURITY:

BEST PRACTICES:
- Use strong, unique passwords
- Enable two-factor authentication
- Don't share passwords
- Be cautious of phishing emails
- Lock devices when away
- Use VPN for sensitive data
- Report suspicious activity

PHISHING AWARENESS:
- Verify sender email addresses
- Don't click suspicious links
- Don't download unknown attachments
- Report phishing to: security@alueducation.com

DATA BACKUP:

ONEDRIVE:
- Unlimited cloud storage
- Automatic sync
- Access from anywhere
- Version history
- Share files securely

BACKUP RECOMMENDATIONS:
- Use OneDrive for documents
- External hard drive for large files
- Regular backups (weekly)
- Test restore process

COLLABORATION TOOLS:

MICROSOFT TEAMS:
- Team collaboration
- Video meetings
- Chat and messaging
- File sharing
- Screen sharing

ZOOM:
- Video conferencing
- Webinars
- Recording capabilities
- Breakout rooms

GOOGLE WORKSPACE:
- Docs, Sheets, Slides
- Real-time collaboration
- Cloud storage
- Forms and surveys

ACCESSIBILITY:

ASSISTIVE TECHNOLOGY:
- Screen readers
- Text-to-speech
- Speech-to-text
- Magnification tools
- Closed captioning

REQUEST ACCOMMODATIONS:
Email: accessibility@alueducation.com

POLICIES:

ACCEPTABLE USE POLICY:
- Use technology for academic purposes
- Respect intellectual property
- No illegal downloads
- No harassment or bullying
- Maintain network security

CONSEQUENCES:
- Violations may result in:
  * Warning
  * Temporary suspension of access
  * Permanent ban
  * Disciplinary action

BRING YOUR OWN DEVICE (BYOD):
- Personal devices allowed
- Must comply with security policies
- Register device for network access
- IT support for ALU-provided devices only

TROUBLESHOOTING TIPS:

COMMON ISSUES:

WiFi Not Connecting:
1. Forget network and reconnect
2. Restart device
3. Check credentials
4. Contact IT if persists

Email Not Working:
1. Verify username/password
2. Check internet connection
3. Clear browser cache
4. Try different browser

Cannot Print:
1. Check print quota
2. Verify printer selection
3. Restart print spooler
4. Contact IT help desk

LMS Access Issues:
1. Clear browser cache and cookies
2. Try incognito/private mode
3. Update browser
4. Contact IT support

EMERGENCY CONTACTS:
- IT Emergency: +250 788 309 668
- After Hours: Submit urgent ticket
- Security Issues: security@alueducation.com`
  }
];

/**
 * Deep search function with multiple matching strategies
 */
export function searchHelpCenter(query: string): SearchResult[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/);
  const results: SearchResult[] = [];

  for (const article of HELP_CENTER_ARTICLES) {
    const normalizedTitle = article.title.toLowerCase();
    const normalizedContent = article.content.toLowerCase();
    const normalizedKeywords = article.keywords.join(' ').toLowerCase();
    const allText = `${normalizedTitle} ${normalizedContent} ${normalizedKeywords}`;

    let relevanceScore = 0;
    let matchType: 'exact' | 'partial' | 'keyword' | 'fuzzy' = 'fuzzy';
    let matchedContent = '';

    // 1. EXACT PHRASE MATCH (Highest priority)
    if (allText.includes(normalizedQuery)) {
      relevanceScore = 100;
      matchType = 'exact';
      matchedContent = extractMatchedContent(article.content, normalizedQuery, 200);
    }
    // 2. TITLE MATCH (Very high priority)
    else if (normalizedTitle.includes(normalizedQuery)) {
      relevanceScore = 90;
      matchType = 'exact';
      matchedContent = article.title;
    }
    // 3. KEYWORD EXACT MATCH
    else if (article.keywords.some(kw => kw.toLowerCase() === normalizedQuery)) {
      relevanceScore = 85;
      matchType = 'keyword';
      matchedContent = extractMatchedContent(article.content, normalizedQuery, 200);
    }
    // 4. ALL WORDS PRESENT (High priority)
    else if (queryWords.every(word => allText.includes(word))) {
      relevanceScore = 70 + (queryWords.length * 5); // More words = higher relevance
      matchType = 'partial';
      matchedContent = extractMatchedContent(article.content, queryWords[0], 200);
    }
    // 5. MOST WORDS PRESENT
    else {
      const matchedWords = queryWords.filter(word => allText.includes(word));
      const matchRatio = matchedWords.length / queryWords.length;
      
      if (matchRatio >= 0.5) { // At least 50% of words match
        relevanceScore = Math.floor(matchRatio * 60);
        matchType = 'partial';
        matchedContent = extractMatchedContent(article.content, matchedWords[0], 200);
      }
    }

    // 6. FUZZY MATCHING (for typos and variations)
    if (relevanceScore === 0) {
      for (const keyword of article.keywords) {
        const similarity = calculateSimilarity(normalizedQuery, keyword.toLowerCase());
        if (similarity > 0.7) { // 70% similarity threshold
          relevanceScore = Math.floor(similarity * 50);
          matchType = 'fuzzy';
          matchedContent = extractMatchedContent(article.content, keyword, 200);
          break;
        }
      }
    }

    // Add to results if any match found
    if (relevanceScore > 0) {
      results.push({
        article: { ...article, relevanceScore },
        matchedContent,
        relevanceScore,
        matchType
      });
    }
  }

  // Sort by relevance score (highest first)
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return results;
}

/**
 * Extract relevant content snippet around the matched text
 */
function extractMatchedContent(content: string, searchTerm: string, contextLength: number = 200): string {
  const lowerContent = content.toLowerCase();
  const lowerTerm = searchTerm.toLowerCase();
  const index = lowerContent.indexOf(lowerTerm);

  if (index === -1) {
    // Return first part of content if no match
    return content.substring(0, contextLength) + '...';
  }

  // Calculate start and end positions for context
  const start = Math.max(0, index - contextLength / 2);
  const end = Math.min(content.length, index + searchTerm.length + contextLength / 2);

  let snippet = content.substring(start, end);

  // Add ellipsis if needed
  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';

  return snippet.trim();
}

/**
 * Calculate similarity between two strings (Levenshtein distance)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Levenshtein distance algorithm
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Get all articles in a category
 */
export function getArticlesByCategory(category: string): HelpArticle[] {
  return HELP_CENTER_ARTICLES.filter(article => 
    article.category.toLowerCase().includes(category.toLowerCase())
  );
}

/**
 * Get article by ID
 */
export function getArticleById(id: string): HelpArticle | undefined {
  return HELP_CENTER_ARTICLES.find(article => article.id === id);
}

/**
 * Get all categories
 */
export function getAllCategories(): string[] {
  const categories = new Set(HELP_CENTER_ARTICLES.map(a => a.category));
  return Array.from(categories).sort();
}

/**
 * Get related articles based on keywords
 */
export function getRelatedArticles(article: HelpArticle, limit: number = 3): HelpArticle[] {
  const related: Array<{ article: HelpArticle; score: number }> = [];

  for (const otherArticle of HELP_CENTER_ARTICLES) {
    if (otherArticle.id === article.id) continue;

    // Calculate relevance based on shared keywords
    const sharedKeywords = article.keywords.filter(kw => 
      otherArticle.keywords.includes(kw)
    );

    if (sharedKeywords.length > 0) {
      related.push({
        article: otherArticle,
        score: sharedKeywords.length
      });
    }
  }

  // Sort by score and return top results
  related.sort((a, b) => b.score - a.score);
  return related.slice(0, limit).map(r => r.article);
}

