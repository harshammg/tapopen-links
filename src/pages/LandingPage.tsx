import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, BarChart3, QrCode, Layout, Link2, Globe, AlertTriangle, Users, TrendingDown, Zap, ClipboardPaste, Share2 } from "lucide-react";
import { platforms, testimonials } from "@/lib/data";
import { ScrollFadeIn } from "@/components/ScrollFadeIn";
import { useState } from "react";

const LandingPage = () => {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="font-display text-xl font-bold gradient-text">TapOpen</Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" asChild><Link to="/dashboard">Log in</Link></Button>
            <Button variant="gradient" size="sm" asChild><Link to="/dashboard">Get Started</Link></Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <ScrollFadeIn>
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
              Every tap. <span className="gradient-text">Native app.</span>
            </h1>
          </ScrollFadeIn>
          <ScrollFadeIn delay={100}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Turn any social link into a deep link that opens the real app — not some stripped-down browser.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={200}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button variant="gradient" size="lg" asChild>
                <Link to="/dashboard">Start for free</Link>
              </Button>
              <Button variant="ghost-accent" size="lg">
                See how it works <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </ScrollFadeIn>
          <ScrollFadeIn delay={300}>
            <div className="flex flex-wrap justify-center gap-2">
              {platforms.map((p) => (
                <span key={p.name} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill border text-xs font-medium" style={{ borderColor: `${p.color}30`, color: p.color }}>
                  <p.icon className="h-3.5 w-3.5" />
                  {p.name}
                </span>
              ))}
            </div>
          </ScrollFadeIn>

          {/* Phone mockups */}
          <ScrollFadeIn delay={400} className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <div className="relative">
                <div className="rounded-[2rem] border-2 border-border bg-card p-3 opacity-50">
                  <div className="rounded-[1.5rem] bg-muted aspect-[9/16] flex flex-col items-center justify-center p-6">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-sm text-center">In-app browser<br/>No login • No subscribe • Broken UX</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3 font-medium">Without TapOpen</p>
              </div>
              <div className="relative">
                <div className="rounded-[2rem] border-2 border-primary/40 bg-card p-3 glow">
                  <div className="rounded-[1.5rem] gradient-bg aspect-[9/16] flex flex-col items-center justify-center p-6">
                    <Smartphone className="h-12 w-12 text-primary-foreground mb-4" />
                    <p className="text-primary-foreground text-sm text-center font-medium">Native App<br/>Full experience • Logged in • Converts</p>
                  </div>
                </div>
                <p className="text-sm text-foreground mt-3 font-medium">With TapOpen ✨</p>
              </div>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <ScrollFadeIn>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-center mb-16">
              The hidden friction <span className="gradient-text">killing your reach</span>
            </h2>
          </ScrollFadeIn>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: AlertTriangle, title: "In-app browsers", desc: "Instagram and TikTok trap your links in a crippled browser. No subscriptions. No logins. No conversions." },
              { icon: TrendingDown, title: "Split analytics", desc: "Your YouTube views get fragmented. Spotify plays don't count. Your numbers lie." },
              { icon: Users, title: "Lost followers", desc: "Visitors can't follow, like, or subscribe because they're not logged in inside the in-app browser." },
            ].map((item, i) => (
              <ScrollFadeIn key={item.title} delay={i * 150}>
                <div className="bg-card border border-border rounded-lg p-6 card-hover h-full">
                  <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center mb-4">
                    <item.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-4xl">
          <ScrollFadeIn>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-center mb-16">
              Three steps. <span className="gradient-text">Zero friction.</span>
            </h2>
          </ScrollFadeIn>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: ClipboardPaste, step: "01", title: "Paste your link", desc: "Any Instagram, YouTube, Spotify, or social URL." },
              { icon: Zap, step: "02", title: "Get your deep link", desc: "TapOpen generates a smart redirect instantly." },
              { icon: Share2, step: "03", title: "Share it everywhere", desc: "Bio, stories, DMs, QR codes. Always opens the app." },
            ].map((item, i) => (
              <ScrollFadeIn key={item.step} delay={i * 200}>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="text-xs font-mono text-primary mb-2 block">{item.step}</span>
                  <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento */}
      <section id="features" className="py-20 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-5xl">
          <ScrollFadeIn>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-center mb-16">
              Built for <span className="gradient-text">creators</span>
            </h2>
          </ScrollFadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ScrollFadeIn className="md:col-span-2">
              <div className="bg-card border border-border rounded-lg p-8 card-hover h-full">
                <Smartphone className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-display font-semibold text-xl mb-2">Smart Platform Detection</h3>
                <p className="text-muted-foreground text-sm">Auto-detects Instagram, YouTube, Spotify, TikTok, Twitter, LinkedIn, WhatsApp, Telegram, Snapchat.</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {platforms.slice(0, 5).map((p) => (
                    <span key={p.name} className="px-2 py-1 rounded-pill text-xs border" style={{ borderColor: `${p.color}30`, color: p.color }}>{p.name}</span>
                  ))}
                </div>
              </div>
            </ScrollFadeIn>
            <ScrollFadeIn delay={100}>
              <div className="bg-card border border-border rounded-lg p-8 card-hover h-full">
                <BarChart3 className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-display font-semibold text-lg mb-2">App-Open Analytics</h3>
                <p className="text-muted-foreground text-sm">See % of clicks that opened the native app vs fell back to browser.</p>
              </div>
            </ScrollFadeIn>
            <ScrollFadeIn delay={150}>
              <div className="bg-card border border-border rounded-lg p-8 card-hover h-full">
                <QrCode className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-display font-semibold text-lg mb-2">QR Code Generator</h3>
                <p className="text-muted-foreground text-sm">Every deep link gets a downloadable QR code. For bio, merch, posters.</p>
              </div>
            </ScrollFadeIn>
            <ScrollFadeIn delay={200} className="md:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-full">
                {[
                  { icon: Layout, title: "Bio Page", desc: "One page, all your deep links. The Linktree killer." },
                  { icon: Link2, title: "Custom Slugs", desc: "tapopen.app/yourname" },
                  { icon: Globe, title: "Custom Domains", desc: "links.yourname.com" },
                ].map((f, i) => (
                  <div key={f.title} className="bg-card border border-border rounded-lg p-6 card-hover">
                    <f.icon className="h-6 w-6 text-primary mb-3" />
                    <h3 className="font-display font-semibold text-sm mb-1">{f.title}</h3>
                    <p className="text-muted-foreground text-xs">{f.desc}</p>
                  </div>
                ))}
              </div>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-5xl">
          <ScrollFadeIn>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-center mb-4">
              Simple pricing. <span className="gradient-text">Powerful links.</span>
            </h2>
          </ScrollFadeIn>
          <ScrollFadeIn delay={100}>
            <div className="flex items-center justify-center gap-3 mb-12">
              <span className={`text-sm ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
              <button onClick={() => setAnnual(!annual)} className="relative w-12 h-6 rounded-full bg-muted transition-colors" style={annual ? { background: "linear-gradient(135deg, hsl(253 96% 67%), hsl(348 96% 67%))" } : {}}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-foreground transition-transform duration-300 ${annual ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
              <span className={`text-sm ${annual ? "text-foreground" : "text-muted-foreground"}`}>Annual</span>
              {annual && <span className="text-xs gradient-bg text-primary-foreground px-2 py-0.5 rounded-pill font-medium">20% OFF</span>}
            </div>
          </ScrollFadeIn>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Free", price: 0, features: ["3 active deep links", "All 9 platforms supported", "Hosted redirect page", "Basic click counter", '"Powered by TapOpen" watermark'], cta: "Get started free", variant: "outline" as const },
              { name: "Pro", price: annual ? 399 : 499, popular: true, features: ["Unlimited deep links", "Custom slug (tapopen.app/you)", "Remove watermark", "Analytics dashboard", "App-open vs browser ratio", "QR code for every link", "Bio page (multi-link)"], cta: "Start Pro free for 7 days", variant: "gradient" as const },
              { name: "Creator Pro", price: annual ? 959 : 1199, features: ["Everything in Pro", "Custom domain", "UTM pass-through", "Link scheduling", "API access", "Priority support"], cta: "Contact us", variant: "outline" as const },
            ].map((tier, i) => (
              <ScrollFadeIn key={tier.name} delay={i * 100}>
                <div className={`relative bg-card border rounded-lg p-8 h-full flex flex-col ${tier.popular ? "border-primary glow" : "border-border"}`}>
                  {tier.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-bg text-primary-foreground text-xs font-semibold px-4 py-1 rounded-pill">Most Popular</span>
                  )}
                  <h3 className="font-display font-bold text-lg mb-1">{tier.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-display font-bold">₹{tier.price}</span>
                    <span className="text-muted-foreground text-sm">/mo</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-success mt-0.5">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Button variant={tier.variant} className="w-full">{tier.cta}</Button>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-5xl">
          <ScrollFadeIn>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-center mb-16">
              Creators seeing <span className="gradient-text">real results</span>
            </h2>
          </ScrollFadeIn>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <ScrollFadeIn key={t.handle} delay={i * 150}>
                <div className="bg-card border border-border rounded-lg p-6 card-hover h-full">
                  <p className="text-sm leading-relaxed mb-6 text-foreground/90">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.handle}</p>
                      <p className="text-xs text-muted-foreground">{t.followers}</p>
                    </div>
                  </div>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="font-display text-lg font-bold gradient-text">TapOpen</span>
            <p className="text-xs text-muted-foreground mt-1">Every tap. Native app.</p>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Product</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <span className="cursor-default">Blog</span>
            <span className="cursor-default">Docs</span>
            <span className="cursor-default">Twitter</span>
            <span className="cursor-default">Instagram</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 TapOpen. Built for creators.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
