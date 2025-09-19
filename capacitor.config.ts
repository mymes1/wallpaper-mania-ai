import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.wallpaper.mania',
  appName: 'Wallpaper Mania AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'https://1193acfd-627e-4904-b598-58f33743c0c4.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true
  },
  ios: {
    scheme: 'WallpaperManiaAI'
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