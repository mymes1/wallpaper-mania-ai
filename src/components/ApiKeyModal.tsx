import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Eye, EyeOff, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeySet: (apiKey: string) => void;
}

export const ApiKeyModal = ({ isOpen, onClose, onApiKeySet }: ApiKeyModalProps) => {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast.error("Please enter your MiniMax API key");
      return;
    }

    setIsValidating(true);
    
    try {
      // Basic validation - check if it looks like an API key
      if (apiKey.trim().length < 10) {
        throw new Error("API key appears to be too short");
      }

      onApiKeySet(apiKey.trim());
      toast.success("🎉 API key saved successfully!");
      onClose();
      setApiKey("");
    } catch (error) {
      toast.error("Invalid API key format");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto animate-scale-in">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center animate-float">
            <Key className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <DialogTitle className="text-2xl font-bold mb-2">
              MiniMax API Key Required
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter your MiniMax API key to enable AI video generation
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-sm font-medium">
              API Key
            </Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                placeholder="Enter your MiniMax API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10 bg-wallpaper-card-bg border-wallpaper-card-border"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* API Key Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Key className="w-4 h-4" />
              How to get your API key:
            </h4>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Visit the MiniMax API platform</li>
              <li>Sign up or log in to your account</li>
              <li>Navigate to API keys section</li>
              <li>Generate a new API key</li>
              <li>Copy and paste it here</li>
            </ol>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => window.open('https://api.minimax.io/', '_blank')}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Visit MiniMax API
            </Button>
          </div>

          {/* Security Note */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              🔒 Your API key is stored locally in your browser and never shared with our servers.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isValidating || !apiKey.trim()}
              className="flex-1 bg-gradient-primary hover:opacity-90 text-white"
            >
              {isValidating ? (
                <>
                  <Key className="w-4 h-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Save API Key
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};