import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Smartphone, Monitor, Coins, Download, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { generateImage } from "@/services/ImageService";
import { TokenService } from "@/services/TokenService";
import { WallpaperService } from "@/services/WallpaperService";
import { Capacitor } from "@capacitor/core";

interface GeneratedWallpaper {
  id: string;
  base64: string; // Store as base64 for persistence
  prompt: string;
  orientation: "portrait" | "landscape";
  createdAt: Date;
}

export const WallpaperGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWallpaper, setGeneratedWallpaper] = useState<GeneratedWallpaper | null>(null);

  const promptSuggestions = [
    "Mystical forest with glowing mushrooms",
    "Cyberpunk city at night with neon lights",
    "Serene mountain lake at sunset",
    "Abstract geometric patterns in purple",
    "Space nebula with colorful stars",
    "Minimalist nature landscape"
  ];

  // Load saved wallpaper on mount
  useEffect(() => {
    const saved = localStorage.getItem("currentWallpaper");
    if (saved) {
      try {
        setGeneratedWallpaper(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved wallpaper:", e);
      }
    }
  }, []);

  const generateWallpaper = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to generate a wallpaper");
      return;
    }

    if (!TokenService.canGenerateImage(false)) {
      toast.error("Not enough tokens! You need 50 tokens per generation. You'll get 500 fresh tokens tomorrow.");
      return;
    }

    setIsGenerating(true);
    try {
      if (!TokenService.useTokensForImage(false)) {
        toast.error("Failed to use tokens. Please try again.");
        return;
      }

      const imageUrl = await generateImage(prompt, orientation);
      
      // Convert to base64 for persistent storage
      const base64 = await WallpaperService.imageUrlToBase64(imageUrl);
      
      const newWallpaper: GeneratedWallpaper = {
        id: Date.now().toString(),
        base64,
        prompt,
        orientation,
        createdAt: new Date()
      };

      setGeneratedWallpaper(newWallpaper);
      
      // Save current wallpaper
      localStorage.setItem("currentWallpaper", JSON.stringify(newWallpaper));
      
      // Save to gallery
      const existingWallpapers = JSON.parse(localStorage.getItem("wallpapers") || "[]");
      existingWallpapers.unshift(newWallpaper);
      localStorage.setItem("wallpapers", JSON.stringify(existingWallpapers));
      
      toast.success("🎨 Wallpaper generated successfully!");
    } catch (error) {
      console.error("Generation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to generate wallpaper: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedWallpaper) return;

    if (!TokenService.canDownload(false)) {
      toast.error("No downloads remaining today! You'll get 5 fresh downloads tomorrow.");
      return;
    }
    
    if (!TokenService.useDownload(false)) {
      toast.error("Failed to use download. Please try again.");
      return;
    }

    const dataUrl = WallpaperService.base64ToDataUrl(generatedWallpaper.base64);
    const filename = `wallpaper-${generatedWallpaper.id}.png`;
    
    await WallpaperService.downloadWallpaper(dataUrl, filename);
  };

  const handleSetWallpaper = async () => {
    if (!generatedWallpaper) return;

    const dataUrl = WallpaperService.base64ToDataUrl(generatedWallpaper.base64);
    const filename = `wallpaper-${generatedWallpaper.id}.png`;
    
    await WallpaperService.setAsWallpaper(dataUrl, filename);
  };

  const isNativeAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-4 animate-slide-up">
        <div className="w-16 h-16 mx-auto bg-gradient-hero rounded-2xl flex items-center justify-center animate-float">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold">Create AI Wallpapers</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Describe your dream wallpaper and watch AI bring it to life in seconds
        </p>
        
        {/* Token Status */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Badge variant="outline" className="flex items-center gap-1">
            <Coins className="w-3 h-3" />
            {TokenService.getRemainingTokens(false)} tokens left
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            {TokenService.getRemainingDownloads(false)} downloads left
          </Badge>
        </div>
      </div>

      {/* Generation Form */}
      <Card className="p-6 space-y-6 bg-wallpaper-card-bg border-wallpaper-card-border animate-scale-in">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Enter your prompt</label>
            <Input
              placeholder="Describe your perfect wallpaper..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-secondary/50 border-wallpaper-card-border transition-all duration-300 focus:border-primary/50 focus:shadow-fab"
            />
          </div>

          {/* Orientation Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Orientation</label>
            <div className="flex gap-2">
              <Button
                variant={orientation === "portrait" ? "default" : "outline"}
                size="sm"
                onClick={() => setOrientation("portrait")}
                className="flex items-center gap-2 transition-all duration-300"
              >
                <Smartphone className="w-4 h-4" />
                Portrait (9:16)
              </Button>
              <Button
                variant={orientation === "landscape" ? "default" : "outline"}
                size="sm"
                onClick={() => setOrientation("landscape")}
                className="flex items-center gap-2 transition-all duration-300"
              >
                <Monitor className="w-4 h-4" />
                Landscape (16:9)
              </Button>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateWallpaper}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-primary hover:opacity-90 text-white shadow-fab transition-all duration-500"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Magic...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Wallpaper
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Prompt Suggestions */}
      <div className="space-y-3 animate-slide-up" style={{ animationDelay: "200ms" }}>
        <h3 className="text-sm font-medium text-muted-foreground">Try these prompts:</h3>
        <div className="flex flex-wrap gap-2">
          {promptSuggestions.map((suggestion, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="cursor-pointer hover:bg-gradient-primary/20 transition-all duration-300 hover:scale-105 animate-slide-up"
              style={{ animationDelay: `${300 + index * 50}ms` }}
              onClick={() => setPrompt(suggestion)}
            >
              {suggestion}
            </Badge>
          ))}
        </div>
      </div>

      {/* Generated Result */}
      {generatedWallpaper && (
        <Card className="p-4 bg-wallpaper-card-bg border-wallpaper-card-border animate-scale-in">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Your Generated Wallpaper</h3>
              <Badge className="bg-gradient-primary text-white">
                <ImageIcon className="w-3 h-3 mr-1" />
                {generatedWallpaper.orientation}
              </Badge>
            </div>
            
            <div className="relative">
              <img
                src={WallpaperService.base64ToDataUrl(generatedWallpaper.base64)}
                alt={generatedWallpaper.prompt}
                className="w-full rounded-lg shadow-card"
                style={{
                  aspectRatio: generatedWallpaper.orientation === "portrait" ? "9/16" : "16/9",
                  maxHeight: "300px",
                  objectFit: "cover"
                }}
              />
            </div>

            <p className="text-sm text-muted-foreground">"{generatedWallpaper.prompt}"</p>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              {isNativeAndroid && (
                <Button
                  onClick={handleSetWallpaper}
                  className="flex-1 bg-gradient-primary text-white"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Set as Wallpaper
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
