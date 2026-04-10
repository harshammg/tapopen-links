import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10" />
      
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-700">
        <h2 className="text-5xl md:text-6xl font-display font-bold mb-6 tracking-tighter gradient-text">Opening App</h2>
        <p className="text-slate-400 text-lg font-medium mb-12">Redirecting you to the native application for a seamless experience...</p>
        
        {/* Loading Bar */}
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-12">
          <div className="h-full bg-primary animate-progress-fast w-full origin-left" />
        </div>

        <div className="flex flex-col gap-4">
          <Button 
            variant="ghost" 
            className="text-slate-400 hover:text-white"
            onClick={() => window.history.back()}
          >
            Wait, take me back
          </Button>
          
          <div className="pt-8 border-t border-slate-900">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-4">Taking too long?</p>
            <Button 
              variant="outline" 
              size="sm"
              className="rounded-xl border-slate-800 text-slate-400 hover:text-white"
              onClick={() => window.location.reload()}
            >
              Retry Redirect
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedirectHandler;
