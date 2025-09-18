# 📱 Building APK for Wallpaper Mania AI

## Prerequisites
- Android Studio installed
- Node.js and npm/yarn installed
- Java Development Kit (JDK) 17 or higher

## Step-by-Step Instructions

### 1. Export & Setup Project
1. **Export to GitHub**: Use the "Export to Github" button in Lovable
2. **Clone your repository**:
   ```bash
   git clone <your-github-repo-url>
   cd wallpaper-mania-ai
   ```

### 2. Install Dependencies
```bash
npm install
```

### 3. Add Android Platform
```bash
npx cap add android
```

### 4. Update Native Platform
```bash
npx cap update android
```

### 5. Build Web Assets
```bash
npm run build
```

### 6. Sync with Native Platform
```bash
npx cap sync android
```

### 7. Open in Android Studio
```bash
npx cap open android
```

### 8. Build APK in Android Studio
1. Android Studio will open automatically
2. Wait for Gradle sync to complete
3. Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
4. Once build completes, click **locate** to find your APK file

### 9. Alternative: Command Line Build
If you prefer command line:
```bash
cd android
./gradlew assembleDebug
```
Your APK will be in: `android/app/build/outputs/apk/debug/app-debug.apk`

## 🔧 Configuration Details

### App Information
- **App ID**: `app.lovable.1193acfd627e4904b59858f33743c0c4`
- **App Name**: `wallpaper-mania-ai`
- **Package Name**: Same as App ID

### Hot Reload (Development)
The app is configured to load from Lovable's preview URL for development:
- URL: `https://1193acfd-627e-4904-b598-58f33743c0c4.lovableproject.com?forceHideBadge=true`
- This allows real-time updates during development

### For Production Build
1. Update `capacitor.config.ts` to remove the `server` configuration
2. Run `npm run build` and `npx cap sync` before building APK

## 📋 Troubleshooting

### Common Issues:
1. **Gradle Build Failed**: Update Android SDK and Build Tools in Android Studio
2. **Java Version Issues**: Ensure JDK 17 is installed and set in Android Studio
3. **Permission Errors**: Run Android Studio as administrator if needed

### Dependencies Required:
- **Android SDK**: API level 24 or higher (Android 7.0+)
- **Build Tools**: Latest version
- **Gradle**: Will be handled automatically

## 🚀 Testing Your APK
1. Enable "Unknown Sources" in Android settings
2. Install the APK on your device
3. Test all features including:
   - Image generation
   - Gallery functionality
   - Premium features
   - Orientation changes

## 📚 Additional Resources
- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Android Studio Setup Guide](https://developer.android.com/studio/install)
- [Lovable Mobile Capabilities Blog](https://lovable.dev/blogs/TODO)

---

**Note**: Always test your APK thoroughly before distributing. For production releases, consider using Android App Bundle (.aab) instead of APK for better optimization.