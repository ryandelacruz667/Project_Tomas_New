# API Key Security Best Practices for PROJECT TOMaS Chatbot

## ⚠️ IMPORTANT SECURITY WARNINGS

**Your API key is like a password - keep it secure!**

Following Google's security best practices for API keys:

## 1. ✅ DO NOT Embed API Keys in Code

**❌ NEVER DO THIS:**
```javascript
// BAD - Never embed API keys in code
const API_KEY = 'AIzaSyA-v9HuEvHn7QmjuqVfS-v4mGkNO0tmj8s';
```

**✅ DO THIS INSTEAD:**
- Store API keys in `.env` file (which is in `.gitignore`)
- Use environment variables
- Never commit `.env` files to version control

## 2. ✅ Use Environment Variables

Our implementation already follows this:
- API key is stored in `.env` file
- `.env` is in `.gitignore` (never committed)
- Backend server reads from environment variables
- Frontend never sees the API key

## 3. ✅ Add API Key Restrictions

### In Google Cloud Console:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your API key
3. Click "Edit" (pencil icon)
4. Add restrictions:

   **Application restrictions:**
   - HTTP referrers (for web apps)
   - IP addresses (for servers)
   - Android apps or iOS apps

   **API restrictions:**
   - Restrict to only "Generative Language API"
   - This prevents the key from being used for other Google services

5. Click "Save"

### Benefits:
- Limits damage if key is compromised
- Prevents unauthorized use
- Easier to track usage

## 4. ✅ Delete Unneeded Keys

- Regularly review your API keys
- Delete keys you no longer use
- Keep only active, necessary keys

## 5. ✅ Rotate API Keys Periodically

### When to rotate:
- Every 90 days (recommended)
- If you suspect a key was exposed
- After team member leaves
- Before major releases

### How to rotate:

1. **Create new key:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click "Create Credentials" → "API Key"
   - Configure restrictions (see step 3)
   - Copy the new key

2. **Update application:**
   - Update `.env` file with new key
   - Restart backend server
   - Test the chatbot

3. **Delete old key:**
   - Wait 24-48 hours (ensure no issues)
   - Delete the old key from Google Cloud Console
   - Monitor for any errors

## 6. ✅ Review Code Before Public Release

### Checklist before sharing code:

- [ ] No API keys in any files
- [ ] `.env` file is in `.gitignore`
- [ ] `node_modules` is in `.gitignore`
- [ ] No hardcoded credentials
- [ ] No API keys in comments
- [ ] No API keys in documentation
- [ ] Use `.env.example` files (with placeholders)

### Files that should NEVER contain API keys:
- ❌ `server.js`
- ❌ `package.json`
- ❌ `index.html`
- ❌ Any JavaScript/TypeScript files
- ❌ Documentation files (README, etc.)
- ❌ Configuration files in version control
- ❌ Screenshots or videos

## 7. ✅ Secure File Permissions

On Linux/Mac:
```bash
chmod 600 .env  # Only owner can read/write
```

On Windows:
- Right-click `.env` → Properties → Security
- Remove unnecessary permissions
- Only allow your user account

## 8. ✅ Monitor API Key Usage

### Check usage regularly:

1. Go to: https://console.cloud.google.com/apis/dashboard
2. Monitor:
   - Request counts
   - Error rates
   - Unusual spikes
   - Geographic locations

### Set up alerts:
- Enable billing alerts in Google Cloud Console
- Set spending limits
- Get notified of unusual activity

## 9. ✅ Use Different Keys for Different Environments

- **Development:** Separate key with test restrictions
- **Production:** Separate key with production restrictions
- **Staging:** Separate key for staging environment

This limits blast radius if one key is compromised.

## 10. ✅ If Your Key is Exposed

### Immediate actions:

1. **Delete the exposed key immediately:**
   - Go to Google Cloud Console
   - Delete the compromised key
   - This stops all access instantly

2. **Create a new key:**
   - Follow rotation steps above
   - Update your application
   - Add stricter restrictions

3. **Review access logs:**
   - Check for unauthorized usage
   - Look for unexpected charges
   - Report to Google if needed

4. **Audit your code:**
   - Check Git history (remove key if committed)
   - Review all documentation
   - Check all shared files

5. **Update team:**
   - Notify team members
   - Ensure everyone has new key
   - Review security practices

## Current Security Measures in This Project

✅ **Already Implemented:**

1. ✅ API key stored in `.env` (not in code)
2. ✅ `.env` file in `.gitignore` (never committed)
3. ✅ Backend server architecture (key never exposed to frontend)
4. ✅ Environment variable configuration
5. ✅ No API keys in source code
6. ✅ Documentation uses placeholders

## Action Items for You

### Immediate:

1. ⚠️ **If you've shared your API key publicly:**
   - Delete the current key immediately
   - Create a new key with restrictions
   - Update your `.env` file

2. **Add API key restrictions:**
   - Follow step 3 above
   - Restrict to Generative Language API only
   - Add IP/server restrictions if possible

3. **Review your code:**
   - Check all files for exposed keys
   - Remove any keys from documentation
   - Ensure `.env` is in `.gitignore`

### Ongoing:

1. **Set a reminder to rotate keys:** Every 90 days
2. **Monitor usage:** Weekly or monthly
3. **Review security:** Before major releases
4. **Keep this guide updated:** As practices change

## Additional Resources

- [Google Cloud API Key Security](https://cloud.google.com/docs/authentication/api-keys)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)

## Questions or Issues?

If you suspect your API key has been compromised:
1. Delete it immediately in Google Cloud Console
2. Create a new key with restrictions
3. Review usage logs for unauthorized access
4. Contact Google Cloud Support if needed

---

**Remember: Security is an ongoing process, not a one-time setup!**

