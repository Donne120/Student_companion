# 🔒 Fix HTTPS Issue

## Problem:
Frontend is using `http://` instead of `https://` for the backend URL, causing CORS errors.

Error:
```
Access to fetch at 'http://ngum-alu-chatbot.hf.space/' blocked by CORS
```

Should be:
```
https://ngum-alu-chatbot.hf.space/
```

---

## Quick Fix:

Open browser console (F12) and run:

```javascript
// Clear and set correct URL with HTTPS
localStorage.clear();
localStorage.setItem('BACKEND_URL', 'https://ngum-alu-chatbot.hf.space');
localStorage.setItem('USE_LOCAL_BACKEND', 'true');

// Verify
console.log('Backend URL:', localStorage.getItem('BACKEND_URL'));

// Reload
location.reload();
```

---

## Verify It's Fixed:

After reload, check console. You should see:
```
Backend URL: https://ngum-alu-chatbot.hf.space
```

NOT:
```
Backend URL: http://ngum-alu-chatbot.hf.space
```

---

**Run the fix now and test again!**



