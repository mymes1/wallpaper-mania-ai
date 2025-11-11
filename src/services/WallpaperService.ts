import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { toast } from 'sonner';

export class WallpaperService {
  /**
   * Download wallpaper to device
   */
  static async downloadWallpaper(imageUrl: string, filename: string): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        // Native platform: save to device storage
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const base64Data = await this.blobToBase64(blob);
        
        const savedFile = await Filesystem.writeFile({
          path: filename,
          data: base64Data,
          directory: Directory.Documents,
        });
        
        toast.success('Wallpaper saved to Documents folder!');
        return;
      } else {
        // Web platform: trigger download
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Wallpaper downloaded!');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download wallpaper');
      throw error;
    }
  }

  /**
   * Set wallpaper on Android device
   */
  static async setAsWallpaper(imageUrl: string, filename: string): Promise<void> {
    try {
      if (!Capacitor.isNativePlatform()) {
        toast.info('Wallpaper setting is only available on mobile devices. Download the wallpaper and set it manually.');
        return;
      }

      if (Capacitor.getPlatform() !== 'android') {
        toast.info('Automatic wallpaper setting is only available on Android. Download the wallpaper and set it manually.');
        return;
      }

      // Save image to app's cache directory
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const base64Data = await this.blobToBase64(blob);
      
      const savedFile = await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Cache,
      });

      // Get the native URI
      const fileUri = await Filesystem.getUri({
        path: filename,
        directory: Directory.Cache,
      });

      // Use Share API to open with wallpaper setter
      await Share.share({
        title: 'Set as Wallpaper',
        text: 'Set this image as your wallpaper',
        url: fileUri.uri,
        dialogTitle: 'Set as Wallpaper',
      });

      toast.success('Opening wallpaper setter...');
    } catch (error) {
      console.error('Set wallpaper error:', error);
      toast.error('Failed to set wallpaper. Please download and set manually.');
      throw error;
    }
  }

  /**
   * Convert blob to base64
   */
  private static blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/png;base64,")
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Convert base64 to blob URL for display
   */
  static base64ToDataUrl(base64: string, mimeType: string = 'image/png'): string {
    return `data:${mimeType};base64,${base64}`;
  }

  /**
   * Save image as base64 for persistent storage
   */
  static async imageUrlToBase64(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return await this.blobToBase64(blob);
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  }
}
