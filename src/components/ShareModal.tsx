import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Download,
  Share2,
  Check,
  X
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  platform: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, slug, platform }) => {
  const [copied, setCopied] = React.useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const shareUrl = `${window.location.origin}/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQRCode = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        // Draw background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw QR
        ctx.drawImage(img, 20, 20);
        
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `tapopen-qr-${slug}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
        toast.success("QR Code downloaded!");
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };



  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `TapOpen Redirect`,
          text: `Check out my ${platform} link!`,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Native share failed:", err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl rounded-3xl overflow-hidden p-0 gap-0">
        <div className="bg-primary/5 p-6 border-b border-border text-center">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-2xl font-display font-bold">Share Your Link</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Boost your {platform} profile with direct redirects
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-8">
          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-4 rounded-2xl shadow-inner border border-border"
              ref={qrRef}
            >
              <QRCodeSVG 
                value={shareUrl} 
                size={180} 
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/favicon.ico", // Attempt to include favicon if it exists
                  x: undefined,
                  y: undefined,
                  height: 24,
                  width: 24,
                  excavate: true,
                }}
              />
            </motion.div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadQRCode}
              className="rounded-full font-bold text-xs gap-2"
            >
              <Download className="h-3.5 w-3.5" /> Download QR Code
            </Button>
          </div>



          {/* URL Bar */}
          <div className="space-y-3 pt-2">
            <div className="bg-muted p-1 rounded-2xl flex items-center border border-border">
              <div className="px-4 py-2 text-xs font-mono font-bold text-primary truncate flex-1">
                {shareUrl}
              </div>
              <Button 
                onClick={handleCopy}
                size="sm" 
                className="rounded-xl h-10 px-4 font-bold gap-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>

            <Button 
              onClick={handleNativeShare}
              variant="secondary"
              className="w-full h-12 rounded-2xl font-bold gap-2"
            >
              <Share2 className="h-4 w-4" /> Share More
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
