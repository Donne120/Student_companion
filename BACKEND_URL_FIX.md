# 🔧 FIX: Update Backend URL

## Problem:
Your frontend is calling the WRONG backend:
- ❌ Current: `https://ngum-alu-student-companion.hf.space/chat`
- ✅ Correct: `https://ngum-alu-chatbot.hf.space/api/chat`

## Solution:

### Option 1: Create .env.local file

Create this file: `frontend/.env.local`

```bash
# Backend API URL - CORRECT Hugging Face Space
VITE_API_URL=https://ngum-alu-chatbot.hf.space
```

### Option 2: Update aiService.ts directly

Edit: `frontend/src/services/aiService.ts`

Change line 5 from:
```typescript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
```

To:
```typescript
const API_URL = import.meta.env.VITE_API_URL || "https://ngum-alu-chatbot.hf.space";
```

### Option 3: Use terminal

```bash
cd frontend
echo VITE_API_URL=https://ngum-alu-chatbot.hf.space > .env.local
npm run dev
```

## After fixing:

1. Restart the frontend dev server
2. Refresh the browser
3. Test with "Where is Cameroon?"
4. Should work! ✅
