# Pre-Build Checklist - v1.0.9

## ⚠️ BUILD CREDITS: 8 REMAINING

You have **8 builds left**. After this build, you'll have **7 remaining**.

Let's make absolutely sure everything is correct before building!

## ✅ Verification Checklist

### 1. Plugin File Exists
- [ ] `plugins/withAndroidNetworkSecurity.js` exists
- [ ] Plugin has `withDangerousMod` to copy XML file
- [ ] Plugin creates `res/xml` directory
- [ ] Plugin copies XML to correct location

### 2. XML File Exists
- [ ] `android-network-security-config.xml` exists in project root
- [ ] XML has `base-config` with `cleartextTrafficPermitted="true"`
- [ ] XML includes your IP (192.168.1.30)

### 3. App.json Configuration
- [ ] Plugin is in `plugins` array
- [ ] `usesCleartextTraffic: true` in android config
- [ ] Version is 1.0.9

### 4. API Service
- [ ] No AbortController (removed)
- [ ] Uses primary URL: http://192.168.1.30:24365
- [ ] Has retry logic

### 5. Backend Ready
- [ ] Backend server is running
- [ ] Can access http://192.168.1.30:24365/health from PC browser
- [ ] PC IP is still 192.168.1.30 (run `ipconfig`)

## 🔍 Quick Tests

### Test 1: Check Plugin
```bash
cd frontend/eco-app
cat plugins/withAndroidNetworkSecurity.js | grep "withDangerousMod"
```
Should show: `withDangerousMod`

### Test 2: Check XML
```bash
cat android-network-security-config.xml | grep "base-config"
```
Should show: `<base-config cleartextTrafficPermitted="true">`

### Test 3: Check Backend
```bash
curl http://192.168.1.30:24365/health
```
Should return: `{"status":"OK",...}`

## 🚀 Build Command

Only run this after ALL checks pass:

```bash
eas build --platform android --profile preview
```

## 📊 What This Build Includes

### Network Fixes
✅ No AbortController (no timeouts)
✅ Proper network security config with plugin
✅ Allow all HTTP traffic via base-config
✅ Better error logging

### Plugin Fix
✅ Copies XML to `app/src/main/res/xml/`
✅ Creates directory if needed
✅ Adds reference to AndroidManifest.xml

## 🎯 Expected Result

After installing v1.0.9:
1. App shows "Connected" with green checkmark
2. Products load on home page
3. Search works
4. Categories rotate
5. No "Network Request Failed" errors

## 🆘 If Build Fails

Don't panic! Check the error message:
- If it's about the XML file: The plugin should create it automatically
- If it's about permissions: The base-config allows all HTTP
- If it's something else: Share the error and we'll fix it

## 💡 Alternative If This Doesn't Work

If this build fails or doesn't connect, we can try:
1. Using a different port (8080 instead of 24365)
2. Creating a PC hotspot and connecting phone to it
3. Using ngrok to tunnel the backend

But let's try this first - the plugin approach is the proper solution!

---

**Current Build Credits: 8**
**After This Build: 7**

Let's make it count! 🎯
