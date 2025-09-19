import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Smartphone, Monitor, Video, Coins, Download } from "lucide-react";
import { toast } from "sonner";
import { generateImage } from "@/services/ImageService";
import { minimaxVideoService } from "@/services/MinimaxVideoService";
import { TokenService } from "@/services/TokenService";

interface GeneratedWallpaper {
  id: string;
  url: string;
  prompt: string;
  orientation: "portrait" | "landscape";
  type: "image" | "video";
  createdAt: Date;
  isPremium?: boolean;
}

export const WallpaperGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [generationType, setGenerationType] = useState<"image" | "video">("image");
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

  const generateWallpaper = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to generate a wallpaper");
      return;
    }

    // Check tokens for image generation
    if (generationType === "image" && !TokenService.canGenerateImage(false)) {
      toast.error("Not enough tokens! You need 50 tokens per image. You'll get 500 fresh tokens tomorrow.");
      return;
    }

    setIsGenerating(true);
    try {
      let contentUrl: string;
      
      if (generationType === "video") {
        // Use MiniMax video generation - always landscape for videos
        toast.info("🎬 Starting video generation... This may take a few minutes.");
        contentUrl = await minimaxVideoService.generateVideo(prompt, "landscape");
      } else {
        // Use tokens for image generation
        if (!TokenService.useTokensForImage(false)) {
          toast.error("Failed to use tokens. Please try again.");
          return;
        }
        contentUrl = await generateImage(prompt, orientation);
      }
      
      const newWallpaper: GeneratedWallpaper = {
        id: Date.now().toString(),
        url: contentUrl,
        prompt,
        orientation: generationType === "video" ? "landscape" : orientation,
        type: generationType,
        createdAt: new Date()
      };

      setGeneratedWallpaper(newWallpaper);
      
      // Save to gallery (localStorage for demo)
      const existingWallpapers = JSON.parse(localStorage.getItem("wallpapers") || "[]");
      existingWallpapers.unshift(newWallpaper);
      localStorage.setItem("wallpapers", JSON.stringify(existingWallpapers));
      
      const successMessage = generationType === "video" 
        ? "🎬 Video wallpaper generated successfully!" 
        : "🎨 Wallpaper generated successfully!";
      toast.success(successMessage);
    } catch (error) {
      console.error("Generation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to generate wallpaper: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

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

          {/* Generation Type Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Generation Type</label>
            <div className="flex gap-2">
              <Button
                variant={generationType === "image" ? "default" : "outline"}
                size="sm"
                onClick={() => setGenerationType("image")}
                className="flex items-center gap-2 transition-all duration-300"
              >
                <Sparkles className="w-4 h-4" />
                Image
                <Badge variant="secondary" className="ml-1 text-xs px-1">
                  50 tokens
                </Badge>
              </Button>
              <Button
                variant={generationType === "video" ? "default" : "outline"}
                size="sm"
                onClick={() => setGenerationType("video")}
                className="flex items-center gap-2 transition-all duration-300 relative"
              >
                <Video className="w-4 h-4" />
                Video
                <Badge variant="secondary" className="ml-1 text-xs px-1">
                  Free
                </Badge>
              </Button>
            </div>
          </div>

{/* Orientation Selection - Only show for images */}
          {generationType === "image" && (
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
          )}

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
                {generationType === "video" ? "Creating Video Magic..." : "Generating Magic..."}
              </>
            ) : (
              <>
                {generationType === "video" ? (
                  <>
                    <Video className="w-5 h-5 mr-2" />
                    Generate Video Wallpaper
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Wallpaper
                  </>
                )}
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
              <div className="flex items-center gap-2">
                <Badge className="bg-gradient-primary text-white">
                  {generatedWallpaper.type === "video" ? (
                    <>
                      <Video className="w-3 h-3 mr-1" />
                      Video
                    </>
                  ) : (
                    generatedWallpaper.orientation
                  )}
                </Badge>
              </div>
            </div>
            <div className="relative group">
              {generatedWallpaper.type === "video" ? (
                <video
                  src={generatedWallpaper.url}
                  className="w-full rounded-lg shadow-card transition-transform duration-300 group-hover:scale-[1.02]"
                  style={{
                    aspectRatio: generatedWallpaper.orientation === "portrait" ? "9/16" : "16/9",
                    maxHeight: "300px",
                    objectFit: "cover"
                  }}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={generatedWallpaper.url}
                  alt={generatedWallpaper.prompt}
                  className="w-full rounded-lg shadow-card transition-transform duration-300 group-hover:scale-[1.02]"
                  style={{
                    aspectRatio: generatedWallpaper.orientation === "portrait" ? "9/16" : "16/9",
                    maxHeight: "300px",
                    objectFit: "cover"
                  }}
                />
              )}
              
              {/* Download Button Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (!TokenService.canDownload(false)) {
                      toast.error("No downloads remaining today! You'll get 5 fresh downloads tomorrow.");
                      return;
                    }
                    
                    if (TokenService.useDownload(false)) {
                      const link = document.createElement('a');
                      link.href = generatedWallpaper.url;
                      link.download = `wallpaper-${generatedWallpaper.id}.${generatedWallpaper.type === 'video' ? 'mp4' : 'png'}`;
                      link.click();
                      toast.success("Wallpaper downloaded!");
                    }
                  }}
                  className="animate-scale-in"
                >
                  Download
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground animate-slide-up">"{generatedWallpaper.prompt}"</p>
          </div>
        </Card>
      )}
    </div>
  );
};