const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withAndroidNetworkSecurity(config) {
  // Step 1: Add the network security config reference to AndroidManifest.xml
  config = withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    
    // Add network security config to application tag
    const application = androidManifest.manifest.application[0];
    
    if (!application.$) {
      application.$ = {};
    }
    
    // Add network security config
    application.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    
    // Also ensure usesCleartextTraffic is set
    application.$['android:usesCleartextTraffic'] = 'true';
    
    console.log('✅ Android network security config added to manifest');
    
    return config;
  });

  // Step 2: Copy the network security config XML file to the correct location
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const platformProjectRoot = config.modRequest.platformProjectRoot;
      
      // Source: network security config in project root
      const sourceFile = path.join(projectRoot, 'android-network-security-config.xml');
      
      // Destination: Android res/xml folder
      const destDir = path.join(platformProjectRoot, 'app', 'src', 'main', 'res', 'xml');
      const destFile = path.join(destDir, 'network_security_config.xml');
      
      // Create xml directory if it doesn't exist
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
        console.log('✅ Created res/xml directory');
      }
      
      // Copy the file
      if (fs.existsSync(sourceFile)) {
        fs.copyFileSync(sourceFile, destFile);
        console.log('✅ Copied network_security_config.xml to', destFile);
      } else {
        console.warn('⚠️ Source file not found:', sourceFile);
        
        // Create a default network security config if source doesn't exist
        const defaultConfig = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>`;
        
        fs.writeFileSync(destFile, defaultConfig);
        console.log('✅ Created default network_security_config.xml');
      }
      
      return config;
    },
  ]);

  return config;
};
