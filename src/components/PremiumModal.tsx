import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Video, Sparkles, Zap } from "lucide-react";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export const PremiumModal = ({ isOpen, onClose, onUpgrade }: PremiumModalProps) => {
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await onUpgrade();
    } finally {
      setIsUpgrading(false);
    }
  };

  const premiumFeatures = [
    {
      icon: Video,
      title: "AI Video Wallpapers",
      description: "Generate stunning 8-second animated wallpapers"
    },
    {
      icon: Zap,
      title: "Faster Generation",
      description: "Priority processing for instant results"
    },
    {
      icon: Sparkles,
      title: "Premium Models",
      description: "Access to advanced AI models for better quality"
    },
    {
      icon: Crown,
      title: "Unlimited Downloads",
      description: "No limits on wallpaper generation and downloads"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto animate-scale-in">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-premium-gradient rounded-2xl flex items-center justify-center animate-glow">
            <Crown className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <DialogTitle className="text-2xl font-bold mb-2">
              Upgrade to Premium
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Unlock advanced AI features and create stunning video wallpapers
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Premium Features */}
          <div className="space-y-3">
            {premiumFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 p-3 rounded-lg bg-wallpaper-card-bg border border-wallpaper-card-border animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-10 h-10 bg-premium-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="bg-premium-gradient p-4 rounded-xl text-center text-white animate-glow">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                LIMITED TIME
              </Badge>
            </div>
            <div className="text-3xl font-bold">$4.99</div>
            <div className="text-sm opacity-90">per month</div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="w-full bg-premium-gradient hover:opacity-90 text-white shadow-fab animate-float"
              size="lg"
            >
              {isUpgrading ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Upgrading...
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5 mr-2" />
                  Upgrade Now
                </>
              )}
            </Button>
            
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};