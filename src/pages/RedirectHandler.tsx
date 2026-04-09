import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Zap } from "lucide-react";

const RedirectHandler = () => {
  const { slug } = useParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performRedirect = async () => {
      if (!slug) return;

      if (!supabase) {
        setError("Supabase is not configured. Redirects cannot be processed.");
        return;
      }

      try {
        // Fetch target URL from Supabase
        const { data, error: fetchError } = await supabase
          .from("links")
          .select("original_url, clicks, platform")
          .eq("slug", slug)
          .single();

        if (fetchError || !data) {
          setError("Link not found or expired.");
          return;
        }

        // Increment Click Count
        await supabase
          .from("links")
          .update({ clicks: data.clicks + 1 })
          .eq("slug", slug);

        // Immediate Deep Link Redirect with history replacement
        window.location.replace(data.original_url);
      } catch (err) {
        setError("An unexpected error occurred.");
      }
    };

    performRedirect();
  }, [slug]);

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

  return (
    <div className="min-h-screen bg-[#00247d] text-white flex flex-col items-center justify-center p-6 text-center font-sans tracking-tight">
      <div className="animate-pulse mb-10">
        <Zap className="h-20 w-20 text-[#f59e0b] shadow-glow" />
      </div>
      <h2 className="text-4xl font-display font-bold mb-3 tracking-tighter">Opening App...</h2>
      <p className="text-white/80 font-medium max-w-xs mx-auto">We're bypassing the in-app browser for a better experience.</p>
      
      <div className="mt-12 flex space-x-3">
        <div className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-3 h-3 bg-white rounded-full animate-bounce" />
      </div>

      <div className="mt-16 pt-12 border-t border-white/10 w-full max-w-sm">
        <p className="text-xs text-white/50 mb-4 lowercase tracking-widest font-bold">Taking too long?</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all border border-white/10"
        >
          Retry Redirect
        </button>
      </div>
    </div>
  );
};

export default RedirectHandler;
