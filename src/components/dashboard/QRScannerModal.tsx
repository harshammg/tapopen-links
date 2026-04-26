import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Camera, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScan }) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (isOpen) {
      setError(null);
      
      // Initialize scanner after a brief delay to ensure DOM is ready
      const timer = setTimeout(() => {
        try {
          scanner = new Html5QrcodeScanner(
            "qr-reader",
            { 
              fps: 10, 
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
              showTorchButtonIfSupported: true
            },
            /* verbose= */ false
          );

          scanner.render(
            (decodedText) => {
              // Success!
              if (scanner) {
                scanner.clear().catch(err => console.error("Failed to clear scanner", err));
              }
              onScan(decodedText);
            },
            (errorMessage) => {
              // Ignore constant "No QR code detected" errors
              if (!errorMessage.includes("NotFoundException")) {
                console.warn(errorMessage);
              }
            }
          );
        } catch (err: any) {
          console.error("Scanner Error:", err);
          setError("Failed to start camera. Please check permissions.");
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (scanner) {
          scanner.clear().catch(err => console.error("Failed to cleanup scanner", err));
        }
      };
    }
  }, [isOpen]);

  const handleManualScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you could use Html5Qrcode.scanFile here
      toast.info("Processing image...");
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
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10 h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <div className="relative aspect-square w-full bg-slate-900 rounded-3xl overflow-hidden border-2 border-white/5 shadow-2xl">
            {error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-destructive opacity-50" />
                <p className="text-sm opacity-70">{error}</p>
                <Button variant="outline" onClick={() => window.location.reload()} className="rounded-xl border-white/10">
                  <RefreshCw className="w-4 h-4 mr-2" /> Retry
                </Button>
              </div>
            ) : (
              <div id="qr-reader" className="w-full h-full" />
            )}
            
            {/* Viewfinder Overlay Decor */}
            {!error && (
              <>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-primary/40 rounded-3xl pointer-events-none animate-pulse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-48 h-0.5 bg-primary/40 shadow-[0_0_15px_rgba(var(--primary),0.5)] pointer-events-none animate-[scan_2s_infinite]" />
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
        #qr-reader { border: none !important; }
        #qr-reader__dashboard { background: transparent !important; border: none !important; color: white !important; }
        #qr-reader__status_span { display: none !important; }
        #qr-reader img { display: none !important; }
        #qr-reader__camera_selection { background: #1e293b !important; color: white !important; border-radius: 8px !important; font-size: 12px !important; padding: 4px !important; }
        #qr-reader__dashboard_section_csr button { 
          background: #3b82f6 !important; 
          color: white !important; 
          border: none !important; 
          border-radius: 12px !important; 
          font-weight: bold !important; 
          font-size: 12px !important;
          padding: 8px 16px !important;
          margin-top: 10px !important;
        }
      `}} />
    </Dialog>
  );
};
