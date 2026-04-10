import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Zap, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ua = navigator.userAgent.toLowerCase();

const isInInstagram = () => ua.includes("instagram");
const isInTikTok    = () => ua.includes("bytedance") || ua.includes("tiktok");
const isInFacebook  = () => ua.includes("fban") || ua.includes("fbav");
const isInAppBrowser = () => isInInstagram() || isInTikTok() || isInFacebook();

const isAndroid = () => ua.includes("android");
const isIOS     = () => /iphone|ipad|ipod/.test(ua);

/**
 * Build a native app deep-link URI from a web URL.
 */
const toAppScheme = (url: string): string | null => {
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");

    if (host.includes("youtube.com") || host.includes("youtu.be")) {
      return `youtube://www.youtube.com${u.pathname}${u.search}`;
    }
    if (host.includes("instagram.com")) {
      return `instagram://user?username=${u.pathname.replace(/\//g, "")}`;
    }
    if (host.includes("spotify.com")) {
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) return `spotify://${parts[0]}/${parts[1]}`;
      return `spotify://`;
    }
    if (host.includes("twitter.com") || host.includes("x.com")) {
      return `twitter://user?screen_name=${u.pathname.replace(/\//g, "")}`;
    }
    if (host.includes("tiktok.com")) {
      return `snssdk1233://user/profile${u.pathname}`;
    }
    if (host.includes("wa.me") || host.includes("whatsapp.com")) {
      const phone = u.pathname.replace(/\//g, "");
      return `whatsapp://send?phone=${phone}`;
    }
    if (host.includes("t.me") || host.includes("telegram.me")) {
      return `tg://resolve?domain=${u.pathname.replace(/\//g, "")}`;
    }
    if (host.includes("linkedin.com")) {
      return `linkedin://profile${u.pathname}`;
    }
    if (host.includes("snapchat.com")) {
      return `snapchat://add/${u.pathname.replace(/\//g, "")}`;
    }
  } catch (_) {}
  return null;
};

/**
 * Android intent:// — forces Chrome to open link externally or launch the app.
 * This is the ONLY reliable method to escape Instagram on Android.
 */
const toAndroidIntent = (url: string): string => {
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");
    const pkg  = host.includes("youtube")   ? "com.google.android.youtube"
               : host.includes("instagram") ? "com.instagram.android"
               : host.includes("spotify")   ? "com.spotify.music"
               : host.includes("twitter") || host.includes("x.com") ? "com.twitter.android"
               : host.includes("tiktok")    ? "com.zhiliaoapp.musically"
               : host.includes("whatsapp")  ? "com.whatsapp"
               : host.includes("telegram")  ? "org.telegram.messenger"
               : host.includes("snapchat")  ? "com.snapchat.android"
               : host.includes("linkedin")  ? "com.linkedin.android"
               : null;

    if (pkg) {
      return `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=${u.protocol.replace(":", "")};package=${pkg};end`;
    }
  } catch (_) {}
  return url;
};

// ─── Component ────────────────────────────────────────────────────────────────

const RedirectHandler = () => {
  const { slug } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState<string | null>(null);
  const [needsManualOpen, setNeedsManualOpen] = useState(false);

  useEffect(() => {
    const performRedirect = async () => {
      if (!slug) return;

      if (!supabase) {
        setError("Supabase is not configured.");
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("links")
          .select("original_url, clicks, platform")
          .eq("slug", slug)
          .single();

        if (fetchError || !data) {
          setError("Link not found or expired.");
          return;
        }

        // Increment click count (fire & forget)
        supabase.from("links").update({ clicks: data.clicks + 1 }).eq("slug", slug);

        const url = data.original_url;
        setTargetUrl(url);

        // ── STRATEGY SELECTION ────────────────────────────────────────────────

        if (isInInstagram() && isAndroid()) {
          // Android Instagram → intent:// is the ONLY way out
          window.location.href = toAndroidIntent(url);
          return;
        }

        if (isInInstagram() && isIOS()) {
          // iOS Instagram → Try app scheme first via iframe trick, then fallback
          const appScheme = toAppScheme(url);
          if (appScheme) {
            const iframe = document.createElement("iframe");
            iframe.style.display = "none";
            iframe.src = appScheme;
            document.body.appendChild(iframe);
            setTimeout(() => {
              document.body.removeChild(iframe);
              setNeedsManualOpen(true);
            }, 1500);
          } else {
            setNeedsManualOpen(true);
          }
          return;
        }

        if ((isInTikTok() || isInFacebook()) && isAndroid()) {
          window.location.href = toAndroidIntent(url);
          return;
        }

        if (isInAppBrowser()) {
          // Generic in-app browser — show manual open prompt
          setNeedsManualOpen(true);
          return;
        }

        // ── NORMAL BROWSER → Simple redirect ─────────────────────────────────
        window.location.replace(url);

      } catch (err) {
        setError("An unexpected error occurred.");
      }
    };

    performRedirect();
  }, [slug]);

  // ── Error State ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
          <Zap className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-display font-bold mb-2">Oops! Link Problem</h1>
        <p className="text-muted-foreground font-medium">{error}</p>
        <a href="/" className="mt-8 text-primary font-bold hover:underline underline-offset-4">Return to TapOpen</a>
      </div>
    );
  }

  // ── Manual Open Prompt (for stubborn in-app browsers on iOS) ────────────────
  if (needsManualOpen && targetUrl) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10" />
        <div className="max-w-md w-full animate-in fade-in zoom-in duration-700">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ExternalLink className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-display font-bold mb-3 text-white">One More Step</h2>
          <p className="text-slate-400 mb-2">Instagram is blocking the automatic redirect.</p>
          <p className="text-slate-500 text-sm mb-10">Tap the button below to open the link in your browser, which will launch the app.</p>
          
          <a href={targetUrl} target="_blank" rel="noopener noreferrer" className="block">
            <Button className="w-full h-14 text-base font-bold rounded-2xl" variant="gradient">
              Open Link in Browser <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </a>
          <p className="mt-6 text-[10px] uppercase tracking-widest text-slate-600 font-bold">
            Or copy this link manually: {window.location.href}
          </p>
        </div>
      </div>
    );
  }

  // ── Default Loading Screen ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10" />
      
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-700">
        <h2 className="text-5xl md:text-6xl font-display font-bold mb-6 tracking-tighter gradient-text">Opening App</h2>
        <p className="text-slate-400 text-lg font-medium mb-12">Bypassing the in-app browser and launching the native app...</p>
        
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-12">
          <div className="h-full bg-primary animate-progress-fast w-full origin-left" />
        </div>

        <div className="flex flex-col gap-4">
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => window.history.back()}>
            Wait, take me back
          </Button>
          <div className="pt-8 border-t border-slate-900">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-4">Taking too long?</p>
            {targetUrl && (
              <a href={targetUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="rounded-xl border-slate-800 text-slate-400 hover:text-white">
                  Open directly <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedirectHandler;
