import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Zap, ClipboardPaste, Share2, Shield, Globe, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { platforms } from "@/lib/data";
import { ScrollFadeIn } from "@/components/ScrollFadeIn";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <Link to="/" className="font-display text-xl font-bold gradient-text">TapOpen</Link>
          <div className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <a href="#how-it-works" className="hover:text-primary transition-colors">How it works</a>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" size="sm" className="font-bold text-xs uppercase" asChild><Link to="/login">Login</Link></Button>
            <Button variant="gradient" size="sm" className="font-bold text-xs uppercase px-6" asChild><Link to="/signup">Join Now</Link></Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />
        
        <div className="container mx-auto text-center max-w-4xl">
          <ScrollFadeIn>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8">
              <Zap className="h-3 w-3" /> The Link-in-Bio Secret
            </div>
          </ScrollFadeIn>
          <ScrollFadeIn delay={100}>
            <h1 className="text-6xl md:text-8xl font-display font-bold mb-8 leading-[0.9] tracking-tighter">
              Bypass the <br /><span className="gradient-text">In-App Browser.</span>
            </h1>
          </ScrollFadeIn>
          <ScrollFadeIn delay={200}>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              Stop losing subscribers to "un-logged" browsers. Open your YouTube, Instagram, and Spotify links directly in the native apps.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gradient" size="lg" className="h-16 px-10 rounded-2xl text-md font-bold shadow-xl shadow-primary/20" asChild>
                <Link to="/signup">Create Your First Deep Link</Link>
              </Button>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* The Problem (Visualized) */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center font-display">
            <ScrollFadeIn>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">
                Why your links are <span className="text-destructive">broken.</span>
              </h2>
              <div className="space-y-8">
                <ProblemItem 
                  title="The 'Log-in' Wall" 
                  desc="In-app browsers (Instagram, TikTok) don't have your users logged in. They can't follow, like, or subscribe to you."
                />
                <ProblemItem 
                  title="Lost Analytics" 
                  desc="When users watch your content in a browser, your platform stats (Spotify plays, YT views) often don't count."
                />
                <ProblemItem 
                  title="Poor Experience" 
                  desc="Slow loading times and generic interfaces kill the excitement of your content."
                />
              </div>
            </ScrollFadeIn>
            <ScrollFadeIn delay={200}>
              <div className="relative aspect-square rounded-[40px] border border-border bg-card p-1 items-center justify-center flex flex-col shadow-inner overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full gradient-bg opacity-5 -z-10" />
                <div className="w-48 h-1 bg-destructive/20 rounded-full mb-8" />
                <div className="text-center p-8">
                  <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                  <p className="text-2xl font-bold text-destructive mb-2 truncate">UNSUCCESSFUL TAP</p>
                  <p className="text-sm text-muted-foreground font-medium">Visitor dropped off at "Please Log In" screen.</p>
                </div>
                <div className="w-1/2 h-1 bg-destructive/10 rounded-full mt-8" />
              </div>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section id="how-it-works" className="py-32 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <ScrollFadeIn>
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-20 tracking-tight">
              One link, <span className="gradient-text">Native Power.</span>
            </h2>
          </ScrollFadeIn>
          <div className="grid md:grid-cols-3 gap-12">
            <StepItem icon={ClipboardPaste} step="01" title="Paste any URL" desc="Paste your YouTube video or Instagram post." />
            <StepItem icon={Zap} step="02" title="Magic Deep Link" desc="We generate a high-performance redirect." />
            <StepItem icon={Share2} step="03" title="Viral Growth" desc="Share anywhere. Watch your engagement soar." />
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-24 border-y border-border bg-card overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap gap-12 w-max items-center">
          {[...platforms, ...platforms].map((p, i) => (
            <div key={`${p.name}-${i}`} className="flex items-center gap-4 px-8 py-6 rounded-3xl border border-border shadow-sm hover:border-primary transition-colors bg-background">
              <p.icon className="h-8 w-8 text-primary" />
              <span className="text-lg font-display font-bold">{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 text-center">
        <div className="container mx-auto max-w-3xl bg-primary text-primary-foreground rounded-[60px] p-16 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
          <ScrollFadeIn>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 leading-tight">Ready to increase your <br />engagement by 40%?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" className="h-16 px-10 rounded-2xl text-md font-bold" asChild>
                <Link to="/signup text-primary">Get Your Free Links</Link>
              </Button>
            </div>
            <p className="mt-8 text-sm font-bold uppercase tracking-widest opacity-80">No credit card required for free tier</p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-display font-bold text-lg tracking-tighter">TapOpen</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">© 2025 TapOpen Inc. • Every Tap. Native App.</p>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <Link to="/pricing" className="hover:text-primary">Pricing</Link>
            <a href="#" className="hover:text-primary">Terms</a>
            <a href="#" className="hover:text-primary">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const ProblemItem = ({ title, desc }: { title: string; desc: string }) => (
  <div className="flex gap-4">
    <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
    <div>
      <h3 className="text-xl font-bold mb-1">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  </div>
);

const StepItem = ({ icon: Icon, step, title, desc }: { icon: any; step: string; title: string; desc: string }) => (
  <div className="group relative">
    <div className="mb-8 w-24 h-24 rounded-[32px] gradient-bg flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-500">
      <Icon className="h-10 w-10 text-primary-foreground" />
      <span className="absolute -top-4 -right-4 w-12 h-12 bg-background border border-border rounded-full flex items-center justify-center text-xs font-bold font-mono shadow-lg text-primary">{step}</span>
    </div>
    <h3 className="text-2xl font-bold mb-3">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
