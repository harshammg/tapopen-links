import React, { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Camera, RefreshCw, AlertCircle, FlipHorizontal } from "lucide-react";
import { toast } from "sonner";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScan }) => {
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const qrCodeInstance = useRef<Html5Qrcode | null>(null);

  const startScanner = async (mode: "user" | "environment") => {
    if (!qrCodeInstance.current) {
      qrCodeInstance.current = new Html5Qrcode("qr-reader");
    }

    try {
      if (qrCodeInstance.current.isScanning) {
        await qrCodeInstance.current.stop();
      }

      await qrCodeInstance.current.start(
        { facingMode: mode },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          onScan(decodedText);
          onClose();
        },
        () => {
          // Failure is ignored as it's usually just "QR code not found"
        }
      );
      setIsCameraActive(true);
      setError(null);
    } catch (err: any) {
      console.error("Scanner Error:", err);
      setError("Failed to start camera. Please check permissions.");
      setIsCameraActive(false);
    }
  };

  const stopScanner = async () => {
    if (qrCodeInstance.current && qrCodeInstance.current.isScanning) {
      try {
        await qrCodeInstance.current.stop();
        setIsCameraActive(false);
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        startScanner(facingMode);
      }, 500);

      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen]);

  const toggleCamera = async () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    await startScanner(newMode);
  };

  const handleManualScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.info("Processing image...");
      // For a more complete implementation, you'd use qrCodeInstance.current.scanFile(file)
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-black border-white/10 text-white p-0 overflow-hidden rounded-[2.5rem]">
        <div className="relative p-6 space-y-6">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Scan QR Code
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleCamera} 
                className="rounded-full hover:bg-white/10 h-8 w-8"
                title="Switch Camera"
              >
                <FlipHorizontal className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10 h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="relative aspect-square w-full bg-slate-900 rounded-3xl overflow-hidden border-2 border-white/5 shadow-2xl">
            {error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-destructive opacity-50" />
                <p className="text-sm opacity-70">{error}</p>
                <Button variant="outline" onClick={() => startScanner(facingMode)} className="rounded-xl border-white/10">
                  <RefreshCw className="w-4 h-4 mr-2" /> Retry
                </Button>
              </div>
            ) : (
              <div id="qr-reader" className="w-full h-full" />
            )}
            
            {/* Viewfinder Overlay Decor */}
            {!error && isCameraActive && (
              <>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-primary/40 rounded-3xl pointer-events-none animate-pulse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-48 h-0.5 bg-primary/40 shadow-[0_0_15px_rgba(var(--primary),0.5)] pointer-events-none animate-[scan_2s_infinite]" />
                
                {/* Floating Mobile Camera Switch */}
                <button 
                  onClick={toggleCamera}
                  className="absolute bottom-4 right-4 w-12 h-12 bg-primary/20 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white shadow-2xl active:scale-90 transition-all z-20 md:hidden"
                >
                  <FlipHorizontal className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div className="text-center space-y-4 pb-2">
            <p className="text-xs opacity-50 font-medium px-8">
              Point your camera at a TapOpen QR code or any URL to instantly connect.
            </p>
            
            <div className="pt-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-30 cursor-pointer hover:opacity-100 transition-opacity">
                Upload image instead
                <input type="file" accept="image/*" className="hidden" onChange={handleManualScan} />
              </label>
            </div>
          </div>
        </div>
      </DialogContent>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0%, 100% { top: 30%; }
          50% { top: 70%; }
        }
        #qr-reader video { 
          width: 100% !important; 
          height: 100% !important; 
          object-fit: cover !important;
          border-radius: 1.5rem !important;
        }
      `}} />
    </Dialog>
  );
};
