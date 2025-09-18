import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Smartphone, Monitor } from "lucide-react";
import { toast } from "sonner";

interface GeneratedWallpaper {
  id: string;
  url: string;
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

  const generateWallpaper = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to generate a wallpaper");
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate realistic AI generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate based on prompt themes for more realistic results
      const themes = {
        "forest": "384",
        "city": "385", 
        "mountain": "386",
        "space": "387",
        "abstract": "388",
        "nature": "389"
      };
      
      const promptLower = prompt.toLowerCase();
      let imageId = "390"; // default
      
      for (const [theme, id] of Object.entries(themes)) {
        if (promptLower.includes(theme)) {
          imageId = id;
          break;
        }
      }
      
      const newWallpaper: GeneratedWallpaper = {
        id: Date.now().toString(),
        url: `https://picsum.photos/id/${imageId}/${orientation === "portrait" ? "1080/1920" : "1920/1080"}`,
        prompt,
        orientation,
        createdAt: new Date()
      };

      setGeneratedWallpaper(newWallpaper);
      
      // Save to gallery (localStorage for demo)
      const existingWallpapers = JSON.parse(localStorage.getItem("wallpapers") || "[]");
      existingWallpapers.unshift(newWallpaper);
      localStorage.setItem("wallpapers", JSON.stringify(existingWallpapers));
      
      toast.success("🎨 Wallpaper generated successfully!");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate wallpaper. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-gradient-hero rounded-2xl flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold">Create AI Wallpapers</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Describe your dream wallpaper and watch AI bring it to life in seconds
        </p>
      </div>

      {/* Generation Form */}
      <Card className="p-6 space-y-6 bg-wallpaper-card-bg border-wallpaper-card-border">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Enter your prompt</label>
            <Input
              placeholder="Describe your perfect wallpaper..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-secondary/50 border-wallpaper-card-border"
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
                className="flex items-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                Portrait
              </Button>
              <Button
                variant={orientation === "landscape" ? "default" : "outline"}
                size="sm"
                onClick={() => setOrientation("landscape")}
                className="flex items-center gap-2"
              >
                <Monitor className="w-4 h-4" />
                Landscape
              </Button>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateWallpaper}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-primary hover:opacity-90 text-white shadow-fab"
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
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Try these prompts:</h3>
        <div className="flex flex-wrap gap-2">
          {promptSuggestions.map((suggestion, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="cursor-pointer hover:bg-gradient-primary/20 transition-colors"
              onClick={() => setPrompt(suggestion)}
            >
              {suggestion}
            </Badge>
          ))}
        </div>
      </div>

      {/* Generated Result */}
      {generatedWallpaper && (
        <Card className="p-4 bg-wallpaper-card-bg border-wallpaper-card-border">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Your Generated Wallpaper</h3>
              <Badge className="bg-gradient-primary text-white">
                {generatedWallpaper.orientation}
              </Badge>
            </div>
            <div className="relative">
              <img
                src={generatedWallpaper.url}
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
          </div>
        </Card>
      )}
    </div>
  );
};