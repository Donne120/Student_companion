# 🔧 Factory Reboot Guide for alu-chatbot Space

## Problem:
Space exceeded 50GB storage limit and was evicted.

Source: https://huggingface.co/spaces/Ngum/alu-chatbot

---

## Solution: Factory Reboot

### Step 1: Initiate Factory Reboot

1. **Go to Settings**: https://huggingface.co/spaces/Ngum/alu-chatbot/settings
2. **Scroll down** to "Factory Reboot" section
3. **Click "Factory Reboot"** button
4. **Confirm** when prompted
5. **Wait 2-3 minutes** for rebuild

### What Factory Reboot Does:
- ✅ Clears all cached files (model files, vector DB, logs)
- ✅ Resets storage to 0GB
- ✅ Rebuilds Space from your code
- ✅ Keeps your code intact

---

## Step 2: Monitor Rebuild

After clicking Factory Reboot:

1. **Go to Logs**: https://huggingface.co/spaces/Ngum/alu-chatbot?logs=container
2. **Watch for**:
   ```
   ✅ DocumentProcessor initialized
   ✅ ExtendedRetrievalEngine initialized
   ✅ PromptEngine initialized
   ✅ NypthoIntegration initialized
   ✅ ConversationMemory initialized and loaded
   INFO: Uvicorn running on http://0.0.0.0:7860
   ```

---

## Step 3: Test the Backend

Once rebuild completes:

**Test root endpoint**:
```
https://ngum-alu-chatbot.hf.space/
```

Expected response:
```json
{"status": "ALU Chatbot backend is running"}
```

**Test health endpoint**:
```
https://ngum-alu-chatbot.hf.space/health
```

---

## Step 4: Test Frontend

1. **Clear browser cache** (F12 → Console):
```javascript
localStorage.clear();
localStorage.setItem('BACKEND_URL', 'https://ngum-alu-chatbot.hf.space');
localStorage.setItem('USE_LOCAL_BACKEND', 'true');
location.reload();
```

2. **Go to**: http://localhost:3000

3. **Check backend status** (should be green)

4. **Send a test message**: "What is ALU?"

---

## Why Did This Happen?

The 50GB limit was exceeded due to:
1. **Model files cached** (~1-2GB per model)
2. **Vector database** (ChromaDB files can grow large)
3. **Accumulated logs** over time
4. **Transformers cache** (sentence-transformers models)

---

## Prevent Future Issues:

### Option 1: Upgrade Space (Recommended)
- Upgrade to a paid tier with more storage
- Go to: https://huggingface.co/spaces/Ngum/alu-chatbot/settings
- Click "Upgrade Space"

### Option 2: Optimize Storage Usage
Add to your `app.py` or `main.py`:

```python
import os
import shutil

# Limit transformers cache size
os.environ["TRANSFORMERS_CACHE"] = "/tmp/transformers_cache"
os.environ["HF_HOME"] = "/tmp/huggingface"

# Clean up old cache on startup
def cleanup_cache():
    cache_dirs = [
        "/tmp/transformers_cache",
        "/tmp/huggingface",
        "./data/vectordb"  # If using local vector DB
    ]
    for cache_dir in cache_dirs:
        if os.path.exists(cache_dir):
            try:
                shutil.rmtree(cache_dir)
                os.makedirs(cache_dir, exist_ok=True)
            except Exception as e:
                print(f"Could not clean {cache_dir}: {e}")

# Call on startup
cleanup_cache()
```

---

## Current Status:

✅ Frontend configured to use: `https://ngum-alu-chatbot.hf.space`  
⏳ Waiting for Factory Reboot to complete  
📍 Next: Test backend after reboot  

---

**After Factory Reboot completes, your chatbot should work perfectly!** 🚀



