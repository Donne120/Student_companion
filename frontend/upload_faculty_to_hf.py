"""
Script to upload ALU Faculty data to Hugging Face Space
This will add the faculty information to the knowledge base on your HF space
"""

import json
import os
from huggingface_hub import HfApi, login

# Your Hugging Face space details
SPACE_ID = "Ngum/alu-chatbot"
FACULTY_FILE = "alu_brain/faculty.json"

def create_faculty_knowledge_base():
    """Create the faculty knowledge base in the correct format"""
    
    faculty_data = {
        "category": "faculty",
        "last_updated": "2025-01-30",
        "source": "https://www.alueducation.com/faculty/",
        "entries": [
            {
                "id": "faculty_001",
                "title": "Jeremiah Essuman - Director of Undergraduate Programmes",
                "content": "Jeremiah Essuman is the Director of Undergraduate Programmes at ALU. He oversees all undergraduate programmes, ensuring experiential learning, interdisciplinary curricula, and impactful real-world education. He has a background in IB education and previously served as Communicating for Impact Faculty and Leadership Core Lead at ALU.",
                "keywords": ["jeremiah essuman", "director", "undergraduate programmes", "academic leadership"],
                "metadata": {
                    "name": "Jeremiah Essuman",
                    "role": "Director of Undergraduate Programmes",
                    "department": "Academic Leadership",
                    "email_contact": "info@alueducation.com"
                }
            },
            {
                "id": "faculty_002",
                "title": "Audrine Iradukunda - Foundation Programme Manager",
                "content": "Audrine Iradukunda is the Foundation Programme Manager at ALU. She manages the Foundation Programme's delivery, growth, and improvement, designing programmes to equip learners with skills to tackle pressing African challenges. She holds a Master's degree in Sustainable Development Practice and has over six years of experience in higher education and curriculum design.",
                "keywords": ["audrine iradukunda", "foundation programme", "manager", "curriculum design"],
                "metadata": {
                    "name": "Audrine Iradukunda",
                    "role": "Foundation Programme Manager",
                    "department": "Foundation Programme"
                }
            },
            {
                "id": "faculty_003",
                "title": "Foundation Programme Learning Coaches",
                "content": "The Foundation Programme has multiple learning coaches who support students: Angelique Ishimwe (Senior Associate - facilitator/trainer), Silas N. Gasasira (Associate - mentorship and curriculum delivery), Seth Abimana (Coordinator - coordinates learning coaches), Doris Maduka (Coordinator - foundational curriculum support), Callixte Kagabo (Coordinator - program development), Rene Gitangaza (Senior Associate - leads coach team), Innocent Mugenzi (Senior Associate - business/management modules), Raini Sydney (Senior Associate - Sustainable Development focus), Aline Turinumukiza (Coordinator - mentorship and project management), Lizbeth Uwineza (Senior Associate - communications support), Sylidio Masengesho (Senior Associate - innovative curricula), and Ruth Bazing (Senior Associate - media/communications background).",
                "keywords": ["foundation", "learning coach", "mentorship", "curriculum", "angelique", "silas", "seth", "doris", "callixte", "rene", "innocent", "raini", "aline", "lizbeth", "sylidio", "ruth"],
                "metadata": {
                    "department": "Foundation Programme",
                    "type": "learning_coaches"
                }
            },
            {
                "id": "faculty_004",
                "title": "Self-Directed Learning Skills Lab Team",
                "content": "The Self-Directed Learning Skills Lab is led by Mannoakgotla Medupe (Associate) who mentors students in self-directed learning and supports creative skills development (graphic design, video, sound). Jennifer Umutoni serves as the Skills Lab Coordinator, guiding students to develop essential tech-savvy skills, fostering collaborative learning environments, and supporting mental well-being and inclusivity.",
                "keywords": ["self-directed learning", "skills lab", "mannoakgotla medupe", "jennifer umutoni", "tech skills", "creative skills"],
                "metadata": {
                    "department": "Foundation Programme",
                    "type": "skills_lab"
                }
            },
            {
                "id": "faculty_005",
                "title": "BEL Programme Leadership",
                "content": "The Bachelor in Entrepreneurial Leadership (BEL) programme is managed by Arnaud Michel Nibaruta (BEL Program Manager) who oversees operations and development in the entrepreneurship/leadership track. The programme has two Specialisation Leads: Ryan Johnson (economics & development background, curriculum design) and Dr. Chioma Joy Okonkwo (environmental science + leadership, sustainable solutions focus).",
                "keywords": ["bel", "entrepreneurial leadership", "arnaud nibaruta", "ryan johnson", "dr chioma okonkwo", "program manager"],
                "metadata": {
                    "department": "BEL",
                    "type": "leadership"
                }
            },
            {
                "id": "faculty_006",
                "title": "BEL Business, Strategy, and Investment Coaches",
                "content": "The BEL programme has several Specialisation Learning Coaches for Business, Strategy, and Investment: Mildred Kasaya Amugune (business, finance, investment, research on financial inclusion), Nadia Kabanyana (business/entrepreneurship, co-founded health clinic), Titus Lugero (educator, business incubator manager, startup mentor), Nicholas Ssekiziyivu (business management, entrepreneurship, finance, strategy), Dennis Ngobi (entrepreneur & educator, international business), Oreoluwa Akanni Rhoda (digital education & adult learning), Diane Akaliza (entrepreneurship leadership, inclusive learning), and Isaro Marie Reine Kellia (education, entrepreneurship, agriculture, agribusiness).",
                "keywords": ["bel", "business", "strategy", "investment", "mildred", "nadia", "titus", "nicholas", "dennis", "oreoluwa", "diane", "isaro", "entrepreneurship"],
                "metadata": {
                    "department": "BEL",
                    "specialization": "Business, Strategy, and Investment"
                }
            },
            {
                "id": "faculty_007",
                "title": "BEL Policy and Advocacy Coaches",
                "content": "The BEL programme has Specialisation Learning Coaches for Policy and Advocacy: Claudine Ukubereyimfura (policy, advocacy, international relations & global studies background, supports students interested in politics, IR, advocacy) and Celma Costa (political science, media relations background, teaches policy/advocacy, politics, climate change, gender issues).",
                "keywords": ["bel", "policy", "advocacy", "claudine ukubereyimfura", "celma costa", "international relations", "politics"],
                "metadata": {
                    "department": "BEL",
                    "specialization": "Policy and Advocacy"
                }
            },
            {
                "id": "faculty_008",
                "title": "E-Lab (Entrepreneurial Leaders Action Lab) Team",
                "content": "The Entrepreneurial Leaders Action Lab (E-Lab) is led by Benita Sandrine Mulungi (Senior Associate) who oversees the E-Lab program including entrepreneurship experiments, projects, student-led ventures, and innovation labs. Christopher Joel Mensah Hackman (Associate) supports entrepreneurial education and self-directed learning ventures. Bonita Brigitte Umurungi (Coordinator) coordinates E-Lab activities, working on community-driven solutions, social impact projects, and mentorship for young people.",
                "keywords": ["e-lab", "entrepreneurial leaders action lab", "benita mulungi", "christopher hackman", "bonita umurungi", "innovation", "ventures"],
                "metadata": {
                    "department": "E-Lab",
                    "type": "entrepreneurship_lab"
                }
            },
            {
                "id": "faculty_009",
                "title": "Mission Curators - Infrastructure, Agriculture, and Climate",
                "content": "ALU has Mission Curators who guide students in specific mission areas. Fred Nkubito is the Mission Curator Lead for Urbanization and Infrastructure (urban planning/real estate background). Brian Nicholas Neza is the Mission Curator for Agriculture (focus on agriculture and food security, animal production, sustainable food systems). Sevika Varaden Reetoo is the Mission Curator for Climate Change (works on climate change & environmental issues, renewable power & reef restoration projects).",
                "keywords": ["mission curator", "fred nkubito", "urbanization", "infrastructure", "brian neza", "agriculture", "sevika reetoo", "climate change"],
                "metadata": {
                    "department": "Mission Curators",
                    "missions": ["Urbanization", "Agriculture", "Climate Change"]
                }
            },
            {
                "id": "faculty_010",
                "title": "Mission Curators - Arts, Entrepreneurship, and Governance",
                "content": "Mission Curators for creative and governance fields include: Sibongile Musundwa (Arts, Culture & Design - cultural diplomacy, media, arts project management), Kartik Mehta (Job Creation and Entrepreneurship - business creation, performance management, business scaling), and Kagenza Sakufi Rumongi (Governance - politics, civil society, diplomacy, UN missions, youth mentorship).",
                "keywords": ["mission curator", "sibongile musundwa", "arts", "culture", "kartik mehta", "entrepreneurship", "kagenza rumongi", "governance"],
                "metadata": {
                    "department": "Mission Curators",
                    "missions": ["Arts & Culture", "Entrepreneurship", "Governance"]
                }
            },
            {
                "id": "faculty_011",
                "title": "Mission Curators - Education, Gender, and Healthcare",
                "content": "Mission Curators for social impact areas include: Elizabeth Wayua Ndinda (Education - vocational training, youth empowerment, curriculum development), Bosede Funmi Akinbulusere (Gender Equality & Women Empowerment - community development, health, environment, rights), and Carene Roxanne Umugwaneza (Healthcare - global health & healthcare management, health-related projects and research).",
                "keywords": ["mission curator", "elizabeth ndinda", "education", "bosede akinbulusere", "gender equality", "women empowerment", "carene umugwaneza", "healthcare"],
                "metadata": {
                    "department": "Mission Curators",
                    "missions": ["Education", "Gender Equality", "Healthcare"]
                }
            },
            {
                "id": "faculty_012",
                "title": "Software Engineering Programme Leadership",
                "content": "The BSc Software Engineering programme is managed by Binusha Balachandran (SE Programme Manager) who ensures curriculum delivery, academic oversight, and management of software-engineering education. The programme includes specialized coaches in Machine Learning and Information Systems.",
                "keywords": ["software engineering", "binusha balachandran", "bse", "programme manager", "computer science"],
                "metadata": {
                    "department": "Software Engineering",
                    "type": "leadership"
                }
            },
            {
                "id": "faculty_013",
                "title": "Software Engineering Specialisation Coaches",
                "content": "The Software Engineering programme has specialized coaches: Marvin Ogore (Machine Learning - ML/AI for embedded systems, cloud ML deployment, reinforcement learning), Pelin Mutanguha (Information Systems - full-stack web development, instructional design), Wakuma Tekalign Debela (web-stack teaching, DevOps), Herve Musangwa (Linux, version control, Python, databases, full-stack/DevOps fundamentals), and Neza David Tuyishimire (software engineer & data engineer, ML/AI, data engineering, research supervision).",
                "keywords": ["software engineering", "marvin ogore", "machine learning", "pelin mutanguha", "web development", "wakuma debela", "herve musangwa", "neza tuyishimire", "ai", "devops"],
                "metadata": {
                    "department": "Software Engineering",
                    "specializations": ["Machine Learning", "Information Systems", "Web Development", "DevOps"]
                }
            },
            {
                "id": "faculty_014",
                "title": "How to Contact ALU Faculty",
                "content": "To contact ALU faculty members, students can reach out through the following channels: General inquiries: info@alueducation.com, Phone: +250 784 650 219, Help center: help.alueducation.com. For specific programme inquiries, students should contact their respective programme coordinators. The ALU Rwanda Campus is located at Bumbogo, Kigali Innovation City, Next to Azam, Kigali, Rwanda.",
                "keywords": ["contact", "faculty", "email", "phone", "help", "info@alueducation.com"],
                "metadata": {
                    "type": "contact_information",
                    "email": "info@alueducation.com",
                    "phone": "+250 784 650 219",
                    "help_center": "help.alueducation.com",
                    "location": "Bumbogo, Kigali Innovation City, Kigali, Rwanda"
                }
            },
            {
                "id": "faculty_015",
                "title": "ALU Faculty Overview and Statistics",
                "content": "African Leadership University has 47 faculty members across different departments: Foundation Programme (16 faculty members focusing on first-year foundational learning), BEL/Bachelor in Entrepreneurial Leadership (13 faculty members), E-Lab/Entrepreneurial Leaders Action Lab (3 faculty members), Mission Curators (9 faculty members guiding students in specific mission areas), and Software Engineering (6 faculty members). All faculty are committed to ALU's mission-driven approach, focusing on experiential learning, ethical leadership, and preparing students to solve Africa's greatest challenges.",
                "keywords": ["faculty", "overview", "statistics", "total", "departments", "alu staff"],
                "metadata": {
                    "total_faculty": 47,
                    "departments": {
                        "foundation": 16,
                        "bel": 13,
                        "elab": 3,
                        "mission_curators": 9,
                        "software_engineering": 6
                    }
                }
            }
        ]
    }
    
    return faculty_data

def upload_to_huggingface(token=None):
    """Upload the faculty data to Hugging Face Space"""
    
    print("🚀 Starting upload to Hugging Face Space...")
    
    # Login to Hugging Face
    if token:
        login(token=token)
        print("✅ Logged in with provided token")
    else:
        print("⚠️  No token provided. Attempting to use cached credentials...")
        print("   If this fails, run: huggingface-cli login")
    
    # Create the faculty knowledge base
    faculty_data = create_faculty_knowledge_base()
    
    # Save to temporary file
    temp_file = "faculty_temp.json"
    with open(temp_file, 'w', encoding='utf-8') as f:
        json.dump(faculty_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Created faculty knowledge base with {len(faculty_data['entries'])} entries")
    
    # Initialize HF API
    api = HfApi()
    
    try:
        # Upload the file to the space
        api.upload_file(
            path_or_fileobj=temp_file,
            path_in_repo=FACULTY_FILE,
            repo_id=SPACE_ID,
            repo_type="space",
            commit_message="Add complete ALU faculty directory to knowledge base (47 faculty members)"
        )
        
        print(f"✅ Successfully uploaded faculty data to {SPACE_ID}")
        print(f"📁 File location: {FACULTY_FILE}")
        print(f"🌐 View your space at: https://huggingface.co/spaces/{SPACE_ID}")
        
        # Clean up temp file
        os.remove(temp_file)
        print("✅ Cleaned up temporary files")
        
        return True
        
    except Exception as e:
        print(f"❌ Error uploading to Hugging Face: {e}")
        print("\n💡 Troubleshooting:")
        print("   1. Make sure you're logged in: huggingface-cli login")
        print("   2. Check that you have write access to the space")
        print("   3. Verify the space ID is correct: " + SPACE_ID)
        
        # Keep temp file for manual upload
        print(f"\n📁 Temporary file saved at: {temp_file}")
        print("   You can manually upload this file to your Hugging Face space")
        
        return False

def main():
    """Main function"""
    print("=" * 60)
    print("ALU Faculty Data Upload to Hugging Face")
    print("=" * 60)
    print()
    
    # Check if HF token is in environment
    hf_token = os.environ.get('HF_TOKEN') or os.environ.get('HUGGING_FACE_TOKEN')
    
    if hf_token:
        print("✅ Found Hugging Face token in environment variables")
    else:
        print("⚠️  No HF token found in environment variables")
        print("   You can either:")
        print("   1. Run 'huggingface-cli login' first")
        print("   2. Set HF_TOKEN environment variable")
        print()
        
        response = input("Continue anyway? (y/n): ").strip().lower()
        if response != 'y':
            print("❌ Upload cancelled")
            return
    
    # Upload to Hugging Face
    success = upload_to_huggingface(hf_token)
    
    if success:
        print("\n" + "=" * 60)
        print("✅ SUCCESS! Faculty data is now in your knowledge base")
        print("=" * 60)
        print("\n📝 Next steps:")
        print("   1. The chatbot will now be able to answer questions about faculty")
        print("   2. Test it by asking: 'Who is Jeremiah Essuman?'")
        print("   3. Or: 'Tell me about the Software Engineering faculty'")
    else:
        print("\n" + "=" * 60)
        print("⚠️  Upload failed - see troubleshooting steps above")
        print("=" * 60)

if __name__ == "__main__":
    main()

