# 🔧 Backend URL Fix

## Problem:
Your frontend is trying to connect to the wrong URL:
- ❌ Trying: `https://huggingface.co/spaces/Ngum/alu-student-companion/tree/main/backend/`
- ❌ Also trying: `https://ngum-alu-chatbot.hf.space` (returns 503)

## Correct Hugging Face Space URL:
Your Space should be accessible at:
- ✅ **`https://ngum-alu-student-companion.hf.space`**

OR if that doesn't work:
- ✅ **`https://huggingface.co/spaces/Ngum/alu-student-companion`** (but this redirects)

---

## How to Fix:

### Option 1: Update in Settings (Quick Fix)
1. Open your app at `http://localhost:3000`
2. Go to **Settings** → **System Configuration**
3. Toggle **ON** "Use Local Backend"
4. Change Backend URL to: `https://ngum-alu-student-companion.hf.space`
5. Click "Test Connection"
6. If it works, you're done!

### Option 2: Update Default URL in Code

Update the default backend URL in your settings:

**File**: `src/pages/settings/index.tsx` (line 216)

Change:
```typescript
const [backendUrl, setBackendUrl] = useState("https://ngum-alu-chatbot.hf.space");
```

To:
```typescript
const [backendUrl, setBackendUrl] = useState("https://ngum-alu-student-companion.hf.space");
```

**File**: `src/config/api.ts` (line 11)

Change:
```typescript
return 'https://ngum-alu-chatbot.hf.space';
```

To:
```typescript
return 'https://ngum-alu-student-companion.hf.space';
```

**File**: `src/components/chat/BackendStatus.tsx` (line 25)

Change:
```typescript
return "https://ngum-alu-chatbot.hf.space";
```

To:
```typescript
return "https://ngum-alu-student-companion.hf.space";
```

---

## Check Your Hugging Face Space Status:

1. Go to: https://huggingface.co/spaces/Ngum/alu-student-companion
2. Check if the Space is **Running** or **Sleeping**
3. If sleeping, click to wake it up
4. Wait 1-2 minutes for it to start

---

## Test the Connection:

Once your Space is running, test these URLs in your browser:

1. **Root endpoint**: https://ngum-alu-student-companion.hf.space/
   - Should return: `{"status": "ALU Chatbot backend is running"}`

2. **Health endpoint**: https://ngum-alu-student-companion.hf.space/health
   - Should return: `{"status": "healthy", ...}`

3. **API chat endpoint**: https://ngum-alu-student-companion.hf.space/api/chat
   - Should be accessible (POST request)

---

## If Space is Still Down (503):

Your Hugging Face Space might be in an error state. Check:

1. **Go to Space logs**: https://huggingface.co/spaces/Ngum/alu-student-companion/logs
2. Look for errors
3. If you see errors, you may need to:
   - Push the Gemini integration changes we made
   - Factory restart the Space
   - Check if all dependencies are installed

---

**Next Step**: Let me update the default URLs in your code!


