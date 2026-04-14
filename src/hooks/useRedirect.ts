import { useState, useEffect } from "react";
import { linkService } from "@/services/linkService";
import { 
  toAppScheme, 
  toAndroidIntent, 
  isInInstagram, 
  isInAppBrowser, 
  isAndroid, 
  isIOS 
} from "@/lib/deepLinkUtils";
import { Link } from "@/types";

export const useRedirect = (slug: string | undefined) => {
  const [link, setLink] = useState<Link | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsManualOpen, setNeedsManualOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const startRedirect = async () => {
      if (!slug) return;

      try {
        const data = await linkService.getLinkBySlug(slug);
        let url = data.original_url;
        if (!/^https?:\/\//i.test(url)) {
          url = 'https://' + url;
        }

        setLink({ ...data, original_url: url });

        // Tracking (background)
        linkService.recordClick(slug, data.clicks, data.clicks_daily || {}).catch(console.error);

        // Redirect Logic
        if (isInInstagram() && isAndroid()) {
          window.location.href = toAndroidIntent(url);
          setTimeout(() => {
            setNeedsManualOpen(true);
            setIsProcessing(false);
          }, 2000);
          return;
        }

        if (isInInstagram() && isIOS()) {
          const appScheme = toAppScheme(url);
          if (appScheme) {
            const iframe = document.createElement("iframe");
            iframe.style.display = "none";
            iframe.src = appScheme;
            document.body.appendChild(iframe);
            setTimeout(() => {
              document.body.removeChild(iframe);
              setNeedsManualOpen(true);
              setIsProcessing(false);
            }, 1500);
          } else {
            setNeedsManualOpen(true);
            setIsProcessing(false);
          }
          return;
        }

        if (isInAppBrowser()) {
          if (isAndroid()) {
            window.location.href = toAndroidIntent(url);
            setTimeout(() => {
              setNeedsManualOpen(true);
              setIsProcessing(false);
            }, 2000);
          } else {
            setNeedsManualOpen(true);
            setIsProcessing(false);
          }
          return;
        }

        // Standard Browser
        window.location.replace(url);
      } catch (err: any) {
        setError(err.message || "Link not found or expired.");
        setIsProcessing(false);
      }
    };

    startRedirect();
  }, [slug]);

  return {
    link,
    error,
    needsManualOpen,
    isProcessing
  };
};
