import { useState, useEffect } from "react";
import { WallpaperCard } from "@/components/WallpaperCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Grid3X3, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Wallpaper {
  id: string;
  url: string;
  prompt: string;
  orientation: "portrait" | "landscape";
  createdAt: Date;
  isFavorite?: boolean;
}

interface WallpaperGalleryProps {
  showFavorites: boolean;
}

export const WallpaperGallery = ({ showFavorites }: WallpaperGalleryProps) => {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOrientation, setFilterOrientation] = useState<"all" | "portrait" | "landscape">("all");
  const [gridSize, setGridSize] = useState<"small" | "large">("small");

  // Load wallpapers from localStorage
  useEffect(() => {
    const loadWallpapers = () => {
      const stored = localStorage.getItem("wallpapers");
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      
      if (stored) {
        const parsedWallpapers = JSON.parse(stored).map((w: any) => ({
          ...w,
          createdAt: new Date(w.createdAt),
          isFavorite: favorites.includes(w.id)
        }));
        
        if (showFavorites) {
          setWallpapers(parsedWallpapers.filter((w: Wallpaper) => w.isFavorite));
        } else {
          setWallpapers(parsedWallpapers);
        }
      } else if (!showFavorites) {
        // Add some demo wallpapers if no wallpapers exist
        const demoWallpapers: Wallpaper[] = [
          {
            id: "demo1",
            url: "https://picsum.photos/1080/1920?random=1",
            prompt: "Mystical forest with glowing mushrooms",
            orientation: "portrait",
            createdAt: new Date(),
            isFavorite: false
          },
          {
            id: "demo2",
            url: "https://picsum.photos/1920/1080?random=2",
            prompt: "Cyberpunk city at night",
            orientation: "landscape",
            createdAt: new Date(),
            isFavorite: false
          },
          {
            id: "demo3",
            url: "https://picsum.photos/1080/1920?random=3",
            prompt: "Serene mountain lake at sunset",
            orientation: "portrait",
            createdAt: new Date(),
            isFavorite: false
          }
        ];
        setWallpapers(demoWallpapers);
        localStorage.setItem("wallpapers", JSON.stringify(demoWallpapers));
      }
    };

    loadWallpapers();
    
    // Listen for storage changes
    const handleStorageChange = () => loadWallpapers();
    window.addEventListener("storage", handleStorageChange);
    
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [showFavorites]);

  const filteredWallpapers = wallpapers.filter(wallpaper => {
    const matchesSearch = wallpaper.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOrientation = filterOrientation === "all" || wallpaper.orientation === filterOrientation;
    return matchesSearch && matchesOrientation;
  });

  const toggleFavorite = (wallpaperId: string) => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const updatedFavorites = favorites.includes(wallpaperId)
      ? favorites.filter((id: string) => id !== wallpaperId)
      : [...favorites, wallpaperId];
    
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    
    // Update local state
    setWallpapers(prev => prev.map(w => 
      w.id === wallpaperId ? { ...w, isFavorite: !w.isFavorite } : w
    ));
    
    // Trigger storage event for other components
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {showFavorites ? "Favorites" : "Gallery"}
          </h2>
          <p className="text-muted-foreground">
            {filteredWallpapers.length} wallpaper{filteredWallpapers.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setGridSize(gridSize === "small" ? "large" : "small")}
          className="flex items-center gap-2"
        >
          {gridSize === "small" ? <Grid3X3 className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search wallpapers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-wallpaper-card-bg border-wallpaper-card-border"
          />
        </div>

        <div className="flex gap-2 items-center">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Badge
            variant={filterOrientation === "all" ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setFilterOrientation("all")}
          >
            All
          </Badge>
          <Badge
            variant={filterOrientation === "portrait" ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setFilterOrientation("portrait")}
          >
            Portrait
          </Badge>
          <Badge
            variant={filterOrientation === "landscape" ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setFilterOrientation("landscape")}
          >
            Landscape
          </Badge>
        </div>
      </div>

      {/* Wallpaper Grid */}
      {filteredWallpapers.length > 0 ? (
        <div className={`grid gap-4 ${
          gridSize === "small" 
            ? "grid-cols-2 md:grid-cols-3" 
            : "grid-cols-1 md:grid-cols-2"
        }`}>
          {filteredWallpapers.map((wallpaper) => (
            <WallpaperCard
              key={wallpaper.id}
              wallpaper={wallpaper}
              onToggleFavorite={toggleFavorite}
              size={gridSize}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gradient-primary/20 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {showFavorites ? "No favorites yet" : "No wallpapers found"}
          </h3>
          <p className="text-muted-foreground">
            {showFavorites 
              ? "Start favoriting wallpapers to see them here" 
              : "Try adjusting your search or filters"
            }
          </p>
        </div>
      )}
    </div>
  );
};