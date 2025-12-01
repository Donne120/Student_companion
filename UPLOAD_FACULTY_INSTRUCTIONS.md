# Upload ALU Faculty Data to Hugging Face

This guide will help you add the complete ALU faculty directory (47 faculty members) to your chatbot's knowledge base on Hugging Face.

## Quick Start (3 Steps)

### Step 1: Install Required Package

```bash
pip install huggingface_hub
```

### Step 2: Login to Hugging Face

```bash
huggingface-cli login
```

When prompted, paste your Hugging Face token. You can get your token from:
https://huggingface.co/settings/tokens

### Step 3: Run the Upload Script

```bash
cd alu_student_frontbatoo-main
python upload_complete_faculty_to_hf.py
```

**Optional:** Preview the data before uploading:
```bash
python upload_complete_faculty_to_hf.py preview
```

That's it! The script will:
- ✅ Create a properly formatted faculty knowledge base
- ✅ Upload it to your space: `Ngum/alu-chatbot`
- ✅ Add it to the `alu_brain/faculty.json` file
- ✅ Make it immediately available to your chatbot

## What Gets Added

The script adds **47 faculty members** organized into:

- **Academic Leadership** (1 member)
  - Jeremiah Essuman - Director of Undergraduate Programmes

- **Foundation Programme** (16 members)
  - Programme Manager, Learning Coaches, Skills Lab team

- **BEL Programme** (13 members)
  - Programme Manager, Specialisation Leads, Business/Policy coaches

- **E-Lab** (3 members)
  - Entrepreneurial Leaders Action Lab team

- **Mission Curators** (9 members)
  - Curators for: Agriculture, Climate Change, Arts, Entrepreneurship, Governance, Education, Gender Equality, Healthcare, Infrastructure

- **Software Engineering** (6 members)
  - Programme Manager, ML/AI coaches, Web Development coaches

## After Upload

Once uploaded, your chatbot will be able to answer questions like:

- "Who is Jeremiah Essuman?"
- "Tell me about the Software Engineering faculty"
- "Who teaches Machine Learning at ALU?"
- "Who can I talk to about climate change missions?"
- "List all the Foundation Programme coaches"
- "Who manages the BEL programme?"

## Troubleshooting

### Error: "No HF token found"
**Solution:** Run `huggingface-cli login` and paste your token

### Error: "Permission denied"
**Solution:** Make sure your token has **write** access to the space

### Error: "Space not found"
**Solution:** Verify the space ID is correct: `Ngum/alu-chatbot`

### Manual Upload Option
If the script fails, you can manually upload the generated `faculty_temp.json` file:
1. Go to https://huggingface.co/spaces/Ngum/alu-chatbot/tree/main
2. Navigate to the `alu_brain` folder
3. Click "Add file" → "Upload files"
4. Upload `faculty_temp.json` and rename it to `faculty.json`

## Verify It Worked

1. Go to your space: https://huggingface.co/spaces/Ngum/alu-chatbot
2. Check if `alu_brain/faculty.json` exists
3. Test the chatbot by asking about faculty members

## Need Help?

- Hugging Face Docs: https://huggingface.co/docs/huggingface_hub
- Your Space: https://huggingface.co/spaces/Ngum/alu-chatbot
- ALU Faculty Source: https://www.alueducation.com/faculty/

---

**Note:** This data was collected from the official ALU website on January 30, 2025.

