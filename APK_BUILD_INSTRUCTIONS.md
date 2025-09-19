# 📱 APK Build Instructions for Wallpaper Mania AI

## Prerequisites
- **Android Studio** installed on your computer
- **Java Development Kit (JDK) 11 or higher**
- **Git** installed on your system
- **Node.js** and **npm** installed

## Step-by-Step Build Process

### 1. Export and Clone Project
1. Click the **"Export to GitHub"** button in the Lovable interface
2. Clone your project from GitHub:
   ```bash
   git clone [YOUR_GITHUB_REPO_URL]
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

### 4. Build the Web App
```bash
npm run build
```

### 5. Sync with Capacitor
```bash
npx cap sync android
```

### 6. Open in Android Studio
```bash
npx cap open android
```

### 7. Build APK in Android Studio

#### Option A: Debug APK (for testing)
1. In Android Studio menu: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Wait for build to complete
3. Click **"locate"** in the notification to find your APK
4. APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Option B: Release APK (for distribution)
1. **Generate Signing Key** (first time only):
   ```bash
   keytool -genkey -v -keystore wallpaper-mania-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias wallpaper-mania
   ```

2. **Create/Edit `android/key.properties`**:
   ```properties
   storePassword=your_store_password
   keyPassword=your_key_password
   keyAlias=wallpaper-mania
   storeFile=../wallpaper-mania-release-key.keystore
   ```

3. **Build Release APK**:
   - In Android Studio: **Build → Generate Signed Bundle / APK**
   - Choose **APK**
   - Select your keystore file
   - Enter passwords
   - Choose **release** build variant
   - Click **Finish**

### 8. Install APK on Device
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## Advanced Configuration

### App Details
- **App ID**: `app.lovable.wallpaper.mania`
- **App Name**: `Wallpaper Mania AI`
- **Package Name**: Same as App ID

### App Icons and Splash Screen
1. Replace icons in `android/app/src/main/res/` directories
2. Update `android/app/src/main/res/values/strings.xml` for app name
3. Run `npx cap sync android` after changes

### Permissions (already configured)
The app includes these permissions in `android/app/src/main/AndroidManifest.xml`:
- `INTERNET` - for AI image generation
- `WRITE_EXTERNAL_STORAGE` - for saving wallpapers
- `READ_EXTERNAL_STORAGE` - for reading saved wallpapers

### Troubleshooting

#### Build Errors
- **Gradle sync issues**: File → Sync Project with Gradle Files
- **SDK issues**: Tools → SDK Manager → install required SDKs
- **Java version**: Ensure using JDK 11+

#### Runtime Issues
- **Network errors**: Check internet connection and API keys
- **Storage issues**: Grant storage permissions in device settings

## Testing on Physical Device

### Enable Developer Options
1. Go to **Settings → About Phone**
2. Tap **Build Number** 7 times
3. Enable **USB Debugging** in **Developer Options**

### Install via USB
1. Connect device via USB
2. Run: `adb devices` (should show your device)
3. Run: `adb install [path-to-your-apk]`

## App Store Deployment

### Google Play Store
1. Create Developer Account ($25 one-time fee)
2. Build **Release APK** or **AAB** (Android App Bundle)
3. Upload to Play Console
4. Complete store listing
5. Submit for review

### Key Features Included
- ✅ AI wallpaper generation with multiple APIs
- ✅ Token-based usage system (500 daily tokens for free users)
- ✅ Premium features (unlimited tokens, video generation)
- ✅ Gallery with search and filtering
- ✅ Download and share functionality with usage limits
- ✅ Apply wallpaper feature with usage tracking
- ✅ Favorites system
- ✅ Responsive design for all screen sizes
- ✅ Persistent storage using base64 data URLs

## Fixed Issues in This Version
- ✅ **Gallery black images**: Fixed by using base64 data URLs instead of temporary blob URLs
- ✅ **Download/Apply limits**: Implemented token-based system with daily limits
- ✅ **Share functionality**: Enhanced with mobile-native sharing and clipboard fallback
- ✅ **APK configuration**: Updated with proper app ID and mobile optimizations

## Final Notes
- **First APK build may take 10-15 minutes**
- **Keep your signing key secure** - you'll need it for updates
- **Test thoroughly** on different devices before publishing
- **The app is configured for live reload during development**

For production deployment:
1. Remove the development server URL from `capacitor.config.ts`
2. Build the production version: `npm run build`
3. Sync: `npx cap sync android`
4. Build release APK with signing

Happy building! 🚀