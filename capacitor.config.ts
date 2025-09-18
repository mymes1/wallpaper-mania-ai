import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1193acfd627e4904b59858f33743c0c4',
  appName: 'wallpaper-mania-ai',
  webDir: 'dist',
  server: {
    url: 'https://1193acfd-627e-4904-b598-58f33743c0c4.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1e1b23',
      showSpinner: false
    }
  }
};

export default config;