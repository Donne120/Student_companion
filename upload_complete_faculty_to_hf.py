"""
Script to upload COMPLETE ALU Faculty data (all 47 members) to Hugging Face Space
This reads from the faculty-data.json and converts it to knowledge base format
"""

import json
import os
from huggingface_hub import HfApi, login

# Your Hugging Face space details
SPACE_ID = "Ngum/alu-chatbot"
FACULTY_FILE = "alu_brain/faculty.json"
SOURCE_FILE = "frontend/public/faculty-data.json"

def load_faculty_data():
    """Load the complete faculty data from JSON file"""
    try:
        with open(SOURCE_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ Error: Could not find {SOURCE_FILE}")
        print("   Make sure you're running this from the alu_student_frontbatoo-main directory")
        return None

def convert_to_knowledge_base_format(faculty_json):
    """Convert the faculty JSON to knowledge base format"""
    
    entries = []
    faculty_list = faculty_json.get('faculty', [])
    
    # Create individual entries for each faculty member
    for idx, faculty in enumerate(faculty_list, start=1):
        name = faculty.get('name', '')
        role = faculty.get('role', '')
        department = faculty.get('department', '')
        description = faculty.get('description', '')
        category = faculty.get('category', '')
        
        # Create searchable keywords
        keywords = [
            name.lower(),
            role.lower(),
            department.lower(),
            category
        ]
        
        # Add name parts as keywords
        name_parts = name.lower().split()
        keywords.extend(name_parts)
        
        # Add role keywords
        role_keywords = role.lower().replace('(', '').replace(')', '').split()
        keywords.extend(role_keywords)
        
        # Remove duplicates
        keywords = list(set(keywords))
        
        entry = {
            "id": f"faculty_{idx:03d}",
            "title": f"{name} - {role}",
            "content": f"{name} is the {role} at ALU. {description} Department: {department}. Contact: info@alueducation.com or +250 784 650 219.",
            "keywords": keywords,
            "metadata": {
                "name": name,
                "role": role,
                "department": department,
                "category": category,
                "email_contact": "info@alueducation.com",
                "phone": "+250 784 650 219"
            }
        }
        
        entries.append(entry)
    
    # Add a summary entry
    summary_entry = {
        "id": "faculty_summary",
        "title": "ALU Faculty Overview and Complete Directory",
        "content": f"""African Leadership University has {len(faculty_list)} faculty members across different departments:

**Academic Leadership:** Director of Undergraduate Programmes who oversees all undergraduate programmes.

**Foundation Programme ({sum(1 for f in faculty_list if f.get('category') == 'foundation')} members):** Learning coaches and coordinators who support first-year students with foundational learning, self-directed learning skills, and academic development.

**BEL - Bachelor in Entrepreneurial Leadership ({sum(1 for f in faculty_list if f.get('category') == 'bel')} members):** Programme managers and specialisation coaches covering Business Strategy & Investment, and Policy & Advocacy.

**E-Lab - Entrepreneurial Leaders Action Lab ({sum(1 for f in faculty_list if f.get('category') == 'elab')} members):** Team managing entrepreneurship experiments, student-led ventures, and innovation labs.

**Mission Curators ({sum(1 for f in faculty_list if f.get('category') == 'mission_curators')} members):** Faculty who guide students in specific mission areas including Agriculture, Climate Change, Arts & Culture, Entrepreneurship, Governance, Education, Gender Equality, Healthcare, and Urban Infrastructure.

**Software Engineering ({sum(1 for f in faculty_list if f.get('category') == 'software_engineering')} members):** Programme manager and specialisation coaches covering Machine Learning, Information Systems, Web Development, and DevOps.

All faculty are committed to ALU's mission-driven approach, focusing on experiential learning, ethical leadership, and preparing students to solve Africa's greatest challenges.

To contact any faculty member, reach out to info@alueducation.com or call +250 784 650 219. For specific programme inquiries, contact your respective programme coordinator through help.alueducation.com.""",
        "keywords": ["faculty", "overview", "directory", "all faculty", "complete list", "staff", "professors", "teachers", "coaches", "total", "statistics"],
        "metadata": {
            "total_faculty": len(faculty_list),
            "last_updated": faculty_json.get('last_updated', '2025-01-30'),
            "source": faculty_json.get('source', 'https://www.alueducation.com/faculty/'),
            "departments": faculty_json.get('departments', {})
        }
    }
    
    entries.append(summary_entry)
    
    # Create the knowledge base structure
    knowledge_base = {
        "category": "faculty",
        "last_updated": faculty_json.get('last_updated', '2025-01-30'),
        "source": faculty_json.get('source', 'https://www.alueducation.com/faculty/'),
        "total_entries": len(entries),
        "entries": entries
    }
    
    return knowledge_base

def upload_to_huggingface(token=None):
    """Upload the faculty data to Hugging Face Space"""
    
    print("=" * 70)
    print("🚀 ALU Faculty Data Upload to Hugging Face")
    print("=" * 70)
    print()
    
    # Load faculty data
    print("📖 Loading faculty data from JSON file...")
    faculty_json = load_faculty_data()
    
    if not faculty_json:
        return False
    
    faculty_count = len(faculty_json.get('faculty', []))
    print(f"✅ Loaded {faculty_count} faculty members")
    print()
    
    # Convert to knowledge base format
    print("🔄 Converting to knowledge base format...")
    knowledge_base = convert_to_knowledge_base_format(faculty_json)
    print(f"✅ Created {knowledge_base['total_entries']} knowledge base entries")
    print()
    
    # Save to temporary file
    temp_file = "faculty_complete_temp.json"
    with open(temp_file, 'w', encoding='utf-8') as f:
        json.dump(knowledge_base, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Saved temporary file: {temp_file}")
    print()
    
    # Login to Hugging Face
    if token:
        login(token=token)
        print("✅ Logged in with provided token")
    else:
        print("⚠️  No token provided. Attempting to use cached credentials...")
        print("   If this fails, run: huggingface-cli login")
    
    print()
    
    # Initialize HF API
    api = HfApi()
    
    try:
        print(f"📤 Uploading to {SPACE_ID}...")
        
        # Upload the file to the space
        api.upload_file(
            path_or_fileobj=temp_file,
            path_in_repo=FACULTY_FILE,
            repo_id=SPACE_ID,
            repo_type="space",
            commit_message=f"Add complete ALU faculty directory - all {faculty_count} faculty members with full details"
        )
        
        print()
        print("=" * 70)
        print("✅ SUCCESS! Faculty data uploaded to Hugging Face")
        print("=" * 70)
        print()
        print(f"📊 Upload Summary:")
        print(f"   • Total Faculty Members: {faculty_count}")
        print(f"   • Knowledge Base Entries: {knowledge_base['total_entries']}")
        print(f"   • File Location: {FACULTY_FILE}")
        print(f"   • Space URL: https://huggingface.co/spaces/{SPACE_ID}")
        print()
        
        # Clean up temp file
        os.remove(temp_file)
        print("✅ Cleaned up temporary files")
        
        return True
        
    except Exception as e:
        print()
        print("=" * 70)
        print(f"❌ Error uploading to Hugging Face")
        print("=" * 70)
        print(f"\nError details: {e}")
        print("\n💡 Troubleshooting:")
        print("   1. Make sure you're logged in: huggingface-cli login")
        print("   2. Check that you have write access to the space")
        print("   3. Verify the space ID is correct: " + SPACE_ID)
        print(f"\n📁 Temporary file saved at: {temp_file}")
        print("   You can manually upload this file to your Hugging Face space")
        print("   at: https://huggingface.co/spaces/" + SPACE_ID + "/tree/main/alu_brain")
        
        return False

def preview_data():
    """Preview the data that will be uploaded"""
    print("=" * 70)
    print("📋 Preview of Faculty Data")
    print("=" * 70)
    print()
    
    faculty_json = load_faculty_data()
    if not faculty_json:
        return
    
    faculty_list = faculty_json.get('faculty', [])
    departments = {}
    
    for faculty in faculty_list:
        dept = faculty.get('department', 'Unknown')
        if dept not in departments:
            departments[dept] = []
        departments[dept].append(faculty.get('name', 'Unknown'))
    
    print(f"Total Faculty: {len(faculty_list)}")
    print()
    
    for dept, members in sorted(departments.items()):
        print(f"\n{dept} ({len(members)} members):")
        for name in members:
            print(f"  • {name}")
    
    print()
    print("=" * 70)

def main():
    """Main function"""
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "preview":
        preview_data()
        return
    
    print()
    print("╔" + "═" * 68 + "╗")
    print("║" + " " * 15 + "ALU FACULTY DATA UPLOADER" + " " * 28 + "║")
    print("║" + " " * 10 + "Upload all 47 faculty members to Hugging Face" + " " * 11 + "║")
    print("╚" + "═" * 68 + "╝")
    print()
    
    # Check if HF token is in environment
    hf_token = os.environ.get('HF_TOKEN') or os.environ.get('HUGGING_FACE_TOKEN')
    
    if hf_token:
        print("✅ Found Hugging Face token in environment variables")
        print()
    else:
        print("⚠️  No HF token found in environment variables")
        print()
        print("   You can either:")
        print("   1. Run 'huggingface-cli login' first (recommended)")
        print("   2. Set HF_TOKEN environment variable")
        print()
        
        response = input("Continue anyway? (y/n): ").strip().lower()
        if response != 'y':
            print("\n❌ Upload cancelled")
            print("\n💡 Tip: Run 'python upload_complete_faculty_to_hf.py preview' to preview the data")
            return
        print()
    
    # Upload to Hugging Face
    success = upload_to_huggingface(hf_token)
    
    if success:
        print()
        print("=" * 70)
        print("🎉 ALL DONE! Your chatbot now knows about all ALU faculty!")
        print("=" * 70)
        print()
        print("📝 Test it by asking:")
        print("   • 'Who is Jeremiah Essuman?'")
        print("   • 'Tell me about the Software Engineering faculty'")
        print("   • 'Who teaches Machine Learning?'")
        print("   • 'List all Foundation Programme coaches'")
        print("   • 'Who is the Mission Curator for Climate Change?'")
        print()
    else:
        print()
        print("=" * 70)
        print("⚠️  Upload failed - see troubleshooting steps above")
        print("=" * 70)
        print()

if __name__ == "__main__":
    main()

