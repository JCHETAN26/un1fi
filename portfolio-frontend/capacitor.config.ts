import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.un1fi.app',
  appName: 'un1fi',
  webDir: 'dist',
  plugins: {
    // RevenueCat doesn't need specific Capacitor config
  }
};

export default config;
