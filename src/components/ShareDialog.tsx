import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Share2, 
  Copy, 
  Download, 
  Facebook, 
  Twitter, 
  MessageCircle,
  Mail,
  Link2,
  Check
} from "lucide-react";
import { WallpaperService } from "@/services/WallpaperService";
import { Capacitor } from "@capacitor/core";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  wallpaper: {
    id: string;
    base64?: string;
    url?: string;
    prompt: string;
  };
}

export const ShareDialog = ({ isOpen, onClose, wallpaper }: ShareDialogProps) => {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const getImageUrl = () => {
    if (wallpaper.base64) {
      return WallpaperService.base64ToDataUrl(wallpaper.base64);
    }
    return wallpaper.url || '';
  };

  const shareText = `Check out this amazing AI-generated wallpaper: "${wallpaper.prompt}"`;
  const appUrl = window.location.origin;

  const handleNativeShare = async () => {
    if (!navigator.share) {
      toast.error("Sharing not supported on this device");
      return;
    }

    setIsSharing(true);
    try {
      const imageUrl = getImageUrl();
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `wallpaper-${wallpaper.id}.png`, { type: 'image/png' });
      
      await navigator.share({
        title: 'Amazing AI Wallpaper',
        text: shareText,
        files: [file]
      });
      
      toast.success("Wallpaper shared successfully!");
      onClose();
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Share error:', error);
        toast.error("Failed to share wallpaper");
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${appUrl}`);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleDownloadAndShare = async () => {
    setIsSharing(true);
    try {
      const imageUrl = getImageUrl();
      const filename = `wallpaper-${wallpaper.id}.png`;
      await WallpaperService.downloadWallpaper(imageUrl, filename);
      toast.success("Downloaded! You can now share it from your gallery.");
      onClose();
    } catch (error) {
      toast.error("Failed to download wallpaper");
    } finally {
      setIsSharing(false);
    }
  };

  const handleSocialShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(appUrl);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent('Amazing AI Wallpaper')}&body=${encodedText}%20${encodedUrl}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
      toast.success("Opening share dialog...");
    }
  };

  const isNativePlatform = Capacitor.isNativePlatform();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Wallpaper
          </DialogTitle>
          <DialogDescription>
            Share this amazing wallpaper with your friends
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="relative rounded-lg overflow-hidden border border-border">
            <img
              src={getImageUrl()}
              alt={wallpaper.prompt}
              className="w-full aspect-video object-cover"
            />
          </div>

          <div className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
            "{wallpaper.prompt}"
          </div>

          {/* Native Share (Mobile Priority) */}
          {navigator.share && (
            <Button
              onClick={handleNativeShare}
              disabled={isSharing}
              className="w-full bg-gradient-primary text-white"
              size="lg"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share via...
            </Button>
          )}

          {/* Social Media Sharing */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Share on social media</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => handleSocialShare('twitter')}
                className="flex items-center gap-2"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialShare('facebook')}
                className="flex items-center gap-2"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialShare('whatsapp')}
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialShare('email')}
                className="flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
            </div>
          </div>

          {/* Copy Link */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Or copy link</p>
            <div className="flex gap-2">
              <Input
                readOnly
                value={appUrl}
                className="bg-secondary/50"
              />
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Download & Share */}
          <Button
            variant="outline"
            onClick={handleDownloadAndShare}
            disabled={isSharing}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Download & Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
