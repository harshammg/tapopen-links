import React, { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";
import { Link } from "@/types";

interface EditLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: Link | null;
  onUpdate: (slug: string, updates: Partial<Link>) => Promise<boolean>;
}

const EditLinkModal: React.FC<EditLinkModalProps> = ({ isOpen, onClose, link, onUpdate }) => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (link) {
      setOriginalUrl(link.original_url);
    }
  }, [link]);

  const handleSubmit = async () => {
    if (!link) return;
    setIsSubmitting(true);
    const success = await onUpdate(link.slug, {
      original_url: originalUrl
    });
    if (success) onClose();
    setIsSubmitting(false);
  };

  if (!link) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl rounded-3xl p-0 overflow-hidden">
        <div className="bg-primary/5 p-6 border-b border-border text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-bold">Edit Redirect</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update your link's destination.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <Label htmlFor="edit-url" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
              Destination URL
            </Label>
            <Input
              id="edit-url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              className="h-12 rounded-xl border-border focus:ring-primary focus:border-primary text-base"
            />
          </div>

          <div className="bg-muted/30 p-4 rounded-xl space-y-3">
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5 opacity-60">Redirect Label</p>
              <p className="text-sm font-bold text-foreground">{link.platform}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5 opacity-60">Custom Alias (Read Only)</p>
              <p className="font-mono text-sm font-bold text-primary opacity-50">tapopen.online/{link.slug}</p>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="gradient"
              className="flex-[2] h-12 rounded-xl font-bold"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-12 rounded-xl font-bold px-6"
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

export default EditLinkModal;
