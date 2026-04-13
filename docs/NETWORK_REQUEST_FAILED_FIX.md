# Network Request Failed Fix (v1.0.8)

## The Problem
App shows "Connected" but API requests fail with "Network Request Failed". This means:
- ✅ Discovery works (finds the backend URL)
- ❌ Actual HTTP requests are blocked by Android

## Root Cause
Android's network security policy is blocking HTTP requests even though we set `usesCleartextTraffic: true`. The network security config XML file wasn't being properly included in the build.

## The Solution (v1.0.8)

### 1. Removed AbortController
The AbortController was causing timeout issues in built APKs. Now using simple fetch with no timeout.

### 2. Enhanced Network Security Config
Added `base-config` to allow ALL cleartext traffic:
```xml
<base-config cleartextTrafficPermitted="true">
    <trust-anchors>
        <certificates src="system" />
    </trust-anchors>
</base-config>
```

### 3. Created Expo Config Plugin
Created `plugins/withAndroidNetworkSecurity.js` to ensure the network security config is properly added to AndroidManifest.xml during build.

### 4. Better Error Logging
Added detailed error logging to see exactly what's failing.

## IMPORTANT: This Requires a New Build

❗ **You MUST build a new APK for this fix to work!**

The network security config and plugin changes are NATIVE changes that cannot be pushed via EAS Update.

## Build Command

```bash
cd frontend/eco-app
eas build --platform android --profile preview
```

**This will use 1 build credit. You'll have 10 remaining.**

## Why Can't We Use EAS Update?

EAS Update only works for JavaScript/TypeScript changes. These changes affect:
- AndroidManifest.xml (native)
- Network security config (native)
- Expo config plugins (build-time)

These require a full rebuild.

## After Building

1. Install the new APK (v1.0.8)
2. Open the app
3. Should see "Connected"
4. Products should load immediately
5. Search should work

## If It Still Doesn't Work

### Option 1: Check Backend from Phone Browser
Open your phone's browser and go to:
```
http://192.168.1.30:24365/api/products?limit=1
```

If this works, the issue is the app. If it doesn't work, the issue is network/firewall.

### Option 2: Windows Firewall
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Find Node.js
4. Check BOTH "Private" and "Public" networks
5. Click OK
6. Restart backend server

### Option 3: Router AP Isolation
Some routers have "AP Isolation" or "Client Isolation" enabled, which prevents devices from talking to each other.

1. Log into your router (usually 192.168.1.1)
2. Look for "AP Isolation" or "Client Isolation"
3. Disable it
4. Restart router

### Option 4: Use PC Hotspot
As a test:
1. Create a mobile hotspot from your PC
2. Connect your phone to the PC's hotspot
3. The IP will be different (usually 192.168.137.1)
4. Update BACKEND_URLS in `services/api.ts`
5. Build again

## Version History
- v1.0.3-1.0.7: Various connection attempts
- v1.0.8: **CURRENT** - Proper network security config with plugin

## Build Credits
- Before: 11 builds
- After this build: 10 builds remaining

This is the final fix that should work! The plugin ensures Android properly allows HTTP traffic to your local network. 🎉
