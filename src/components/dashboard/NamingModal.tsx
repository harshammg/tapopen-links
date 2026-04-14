import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NamingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempPlatformName: string;
  setTempPlatformName: (name: string) => void;
  onConfirm: () => void;
}

const NamingModal: React.FC<NamingModalProps> = ({ 
  isOpen, 
  onClose, 
  tempPlatformName, 
  setTempPlatformName, 
  onConfirm 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl rounded-3xl p-0 overflow-hidden">
        <div className="bg-primary/5 p-6 border-b border-border text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-bold">Name Your Redirect</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Give your link a recognizable name for the redirect page.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <Label htmlFor="platform-name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
              Display Name
            </Label>
            <Input
              id="platform-name"
              placeholder="e.g. My Website, Portfolio, App"
              value={tempPlatformName}
              onChange={(e) => setTempPlatformName(e.target.value)}
              className="h-12 rounded-xl border-border focus:ring-primary focus:border-primary text-base"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') onConfirm();
              }}
            />
            <p className="text-[10px] text-muted-foreground px-1 leading-relaxed">
              This name will appear on the loading screen: <span className="text-primary font-bold">"Opening {tempPlatformName || 'App'}"</span>
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="gradient"
              className="flex-[2] h-12 rounded-xl font-bold"
              onClick={onConfirm}
            >
              Create Deep Link
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1 h-12 rounded-xl font-bold"
              onClick={onConfirm}
            >
              Skip
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-12 rounded-xl font-bold px-4"
              onClick={onClose}
            >
              Cancel
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NamingModal;
