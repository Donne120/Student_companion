"""Convert faculty-data.json to knowledge base format for Hugging Face"""
import json

# Load faculty data
with open('public/faculty-data.json', 'r', encoding='utf-8') as f:
    faculty_json = json.load(f)

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
    keywords = [name.lower(), role.lower(), department.lower(), category]
    keywords.extend(name.lower().split())
    keywords.extend(role.lower().replace('(', '').replace(')', '').split())
    keywords = list(set(keywords))
    
    entry = {
        'id': f'faculty_{idx:03d}',
        'title': f'{name} - {role}',
        'content': f'{name} is the {role} at ALU. {description} Department: {department}. Contact: info@alueducation.com or +250 784 650 219.',
        'keywords': keywords,
        'metadata': {
            'name': name,
            'role': role,
            'department': department,
            'category': category,
            'email_contact': 'info@alueducation.com',
            'phone': '+250 784 650 219'
        }
    }
    entries.append(entry)

# Count by category
foundation_count = sum(1 for f in faculty_list if f.get('category') == 'foundation')
bel_count = sum(1 for f in faculty_list if f.get('category') == 'bel')
elab_count = sum(1 for f in faculty_list if f.get('category') == 'elab')
mission_count = sum(1 for f in faculty_list if f.get('category') == 'mission_curators')
se_count = sum(1 for f in faculty_list if f.get('category') == 'software_engineering')

# Add summary entry
summary_content = f"""African Leadership University has {len(faculty_list)} faculty members across different departments:

**Academic Leadership:** Director of Undergraduate Programmes who oversees all undergraduate programmes.

**Foundation Programme ({foundation_count} members):** Learning coaches and coordinators who support first-year students with foundational learning, self-directed learning skills, and academic development.

**BEL - Bachelor in Entrepreneurial Leadership ({bel_count} members):** Programme managers and specialisation coaches covering Business Strategy & Investment, and Policy & Advocacy.

**E-Lab - Entrepreneurial Leaders Action Lab ({elab_count} members):** Team managing entrepreneurship experiments, student-led ventures, and innovation labs.

**Mission Curators ({mission_count} members):** Faculty who guide students in specific mission areas including Agriculture, Climate Change, Arts & Culture, Entrepreneurship, Governance, Education, Gender Equality, Healthcare, and Urban Infrastructure.

**Software Engineering ({se_count} members):** Programme manager and specialisation coaches covering Machine Learning, Information Systems, Web Development, and DevOps.

All faculty are committed to ALU's mission-driven approach, focusing on experiential learning, ethical leadership, and preparing students to solve Africa's greatest challenges.

To contact any faculty member, reach out to info@alueducation.com or call +250 784 650 219. For specific programme inquiries, contact your respective programme coordinator through help.alueducation.com."""

summary_entry = {
    'id': 'faculty_summary',
    'title': 'ALU Faculty Overview and Complete Directory',
    'content': summary_content,
    'keywords': ['faculty', 'overview', 'directory', 'all faculty', 'complete list', 'staff', 'professors', 'teachers', 'coaches', 'total', 'statistics'],
    'metadata': {
        'total_faculty': len(faculty_list),
        'last_updated': faculty_json.get('last_updated', '2025-01-30'),
        'source': faculty_json.get('source', 'https://www.alueducation.com/faculty/'),
        'departments': faculty_json.get('departments', {})
    }
}
entries.append(summary_entry)

# Create knowledge base
knowledge_base = {
    'category': 'faculty',
    'last_updated': faculty_json.get('last_updated', '2025-01-30'),
    'source': faculty_json.get('source', 'https://www.alueducation.com/faculty/'),
    'total_entries': len(entries),
    'entries': entries
}

# Save to output file
output_path = '../../alu-chatbot/alu_brain/faculty.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(knowledge_base, f, indent=2, ensure_ascii=False)

print(f'[OK] Created faculty.json with {len(entries)} entries')
print(f'   - {len(faculty_list)} individual faculty members')
print(f'   - 1 summary entry')
print(f'   - Saved to: {output_path}')

