const { withAndroidStyles } = require('@expo/config-plugins');

module.exports = function withHideNavigationBar(config) {
  return withAndroidStyles(config, async (config) => {
    const styles = config.modResults;
    
    // Add fullscreen theme to hide navigation bar permanently
    const appTheme = styles.resources.style.find(
      style => style.$.name === 'AppTheme'
    );
    
    if (appTheme) {
      // Remove existing windowTranslucentNavigation if present
      appTheme.item = appTheme.item.filter(
        item => item.$.name !== 'android:windowTranslucentNavigation' &&
                item.$.name !== 'android:windowDrawsSystemBarBackgrounds' &&
                item.$.name !== 'android:windowLayoutInDisplayCutoutMode'
      );
      
      // Add items to hide navigation bar
      appTheme.item.push(
        {
          $: { name: 'android:windowTranslucentNavigation' },
          _: 'true'
        },
        {
          $: { name: 'android:windowDrawsSystemBarBackgrounds' },
          _: 'false'
        },
        {
          $: { name: 'android:windowLayoutInDisplayCutoutMode' },
          _: 'shortEdges'
        }
      );
      
      console.log('✅ Added fullscreen theme to hide navigation bar');
    }
    
    return config;
  });
};
