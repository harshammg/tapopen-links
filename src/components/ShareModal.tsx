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
  Twitter,
  Linkedin,
  MessageCircle,
  Copy,
  Download,
  Share2,
  Check,
  Send,
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

  const shareActions = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-[#25D366]",
      action: () => window.open(`https://wa.me/?text=Check out my ${platform} link: ${shareUrl}`, "_blank")
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-[#1DA1F2]",
      action: () => window.open(`https://twitter.com/intent/tweet?text=Check out my ${platform} link:&url=${shareUrl}`, "_blank")
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-[#0A66C2]",
      action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, "_blank")
    },
    {
      name: "Telegram",
      icon: Send,
      color: "bg-[#0088CC]",
      action: () => window.open(`https://t.me/share/url?url=${shareUrl}&text=Check out my ${platform} link`, "_blank")
    }
  ];

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
      <DialogContent 
        hideClose 
        className="fixed bottom-0 top-auto left-0 right-0 translate-y-0 translate-x-0 w-full rounded-t-[40px] rounded-b-none sm:rounded-[32px] sm:relative sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:w-[94%] sm:max-w-md bg-card border-border shadow-2xl overflow-hidden p-0 gap-0 animate-in slide-in-from-bottom duration-500 sm:zoom-in-95"
      >
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mt-4 mb-2 sm:hidden opacity-40" />

        <div className="bg-primary/5 p-6 border-b border-border text-center">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-2xl font-display font-bold">Share Your Link</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Direct redirects for your {platform} profile
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 md:p-8 space-y-8">
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

          {/* Social Grid */}
          <div className="grid grid-cols-4 gap-4">
            {shareActions.map((item) => (
              <button
                key={item.name}
                onClick={item.action}
                className="flex flex-col items-center gap-2 group transition-all"
              >
                <div className={`${item.color} p-3 rounded-2xl text-white shadow-lg group-hover:scale-110 group-active:scale-95 transition-all`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.name}</span>
              </button>
            ))}
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
