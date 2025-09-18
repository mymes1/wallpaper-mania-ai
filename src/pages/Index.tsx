import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WallpaperGenerator } from "@/components/WallpaperGenerator";
import { WallpaperGallery } from "@/components/WallpaperGallery";
import { Sparkles, Image, Heart, Palette } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("generate");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              WallpaperMania
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="generate" className="mt-6">
            <WallpaperGenerator />
          </TabsContent>
          
          <TabsContent value="gallery" className="mt-6">
            <WallpaperGallery showFavorites={false} />
          </TabsContent>
          
          <TabsContent value="favorites" className="mt-6">
            <WallpaperGallery showFavorites={true} />
          </TabsContent>

          {/* Bottom Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border">
            <TabsList className="w-full h-16 bg-transparent rounded-none p-0">
              <TabsTrigger 
                value="generate" 
                className="flex-1 h-full flex-col gap-1 data-[state=active]:bg-gradient-primary/10 data-[state=active]:text-primary"
              >
                <Sparkles className="w-5 h-5" />
                <span className="text-xs">Generate</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="gallery" 
                className="flex-1 h-full flex-col gap-1 data-[state=active]:bg-gradient-primary/10 data-[state=active]:text-primary"
              >
                <Image className="w-5 h-5" />
                <span className="text-xs">Gallery</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="favorites" 
                className="flex-1 h-full flex-col gap-1 data-[state=active]:bg-gradient-primary/10 data-[state=active]:text-primary"
              >
                <Heart className="w-5 h-5" />
                <span className="text-xs">Favorites</span>
              </TabsTrigger>
            </TabsList>
          </nav>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;