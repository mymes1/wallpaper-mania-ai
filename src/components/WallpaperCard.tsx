import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Download, 
  Share2, 
  Smartphone,
  MoreVertical,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Wallpaper {
  id: string;
  url: string;
  prompt: string;
  orientation: "portrait" | "landscape";
  createdAt: Date;
  isFavorite?: boolean;
}

interface WallpaperCardProps {
  wallpaper: Wallpaper;
  onToggleFavorite: (id: string) => void;
  size?: "small" | "large";
}

export const WallpaperCard = ({ wallpaper, onToggleFavorite, size = "small" }: WallpaperCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(wallpaper.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wallpaper-${wallpaper.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Wallpaper downloaded!");
    } catch (error) {
      toast.error("Failed to download wallpaper");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Amazing AI Wallpaper',
          text: `Check out this wallpaper: "${wallpaper.prompt}"`,
          url: wallpaper.url,
        });
        toast.success("Wallpaper shared!");
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(wallpaper.url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleApplyWallpaper = () => {
    // In a real Android app, this would use native APIs
    toast.info("Apply wallpaper feature coming soon!");
  };

  const formatDate = (date: Date) => {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <Card
      className="group relative overflow-hidden bg-wallpaper-card-bg border-wallpaper-card-border hover:bg-wallpaper-card-hover transition-all duration-300 shadow-card hover:shadow-fab/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative">
        <div 
          className={`relative overflow-hidden ${
            size === "large" ? "aspect-[16/10]" : 
            wallpaper.orientation === "portrait" ? "aspect-[9/16]" : "aspect-[16/9]"
          }`}
        >
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-primary/20 animate-pulse rounded-t-lg" />
          )}
          <img
            src={wallpaper.url}
            alt={wallpaper.prompt}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } ${isHovered ? 'scale-105' : 'scale-100'}`}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Overlay with actions */}
          <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                  onClick={() => onToggleFavorite(wallpaper.id)}
                >
                  <Heart 
                    className={`w-4 h-4 ${
                      wallpaper.isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
                    }`} 
                  />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 text-white" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 text-white" />
                </Button>
              </div>
            </div>
          </div>

          {/* Orientation Badge */}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-black/50 text-white">
              {wallpaper.orientation === "portrait" ? (
                <Smartphone className="w-3 h-3 mr-1" />
              ) : (
                <Eye className="w-3 h-3 mr-1" />
              )}
              {wallpaper.orientation}
            </Badge>
          </div>

          {/* More Actions */}
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-black/50 hover:bg-black/70 text-white"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleApplyWallpaper}>
                  <Smartphone className="w-4 h-4 mr-2" />
                  Apply Wallpaper
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-2">
        <p className="text-sm font-medium line-clamp-2">
          {wallpaper.prompt}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDate(wallpaper.createdAt)}</span>
          {wallpaper.isFavorite && (
            <Heart className="w-3 h-3 fill-red-500 text-red-500" />
          )}
        </div>
      </div>
    </Card>
  );
};