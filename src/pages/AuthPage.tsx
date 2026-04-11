import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Mail, Lock, ArrowRight, Check, User, Layout } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { ChevronDown } from "lucide-react";

const COUNTRY_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+1", country: "USA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+92", country: "Pakistan", flag: "🇵🇰" },
  { code: "+880", country: "Bangladesh", flag: "🇧🇩" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
];

const AuthPage = ({ mode }: { mode: "login" | "signup" }) => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [whatsappNo, setWhatsappNo] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!supabase) return;
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigate("/dashboard");
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabase) {
      toast.error("Supabase is not configured. Please check your .env keys.");
      return;
    }

    setIsLoading(true);
    
    try {
      if (mode === "signup") {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: emailOrUsername,
          password,
          options: {
            data: {
              full_name: fullName,
              handle: username.toLowerCase().replace(/\s+/g, ""),
              whatsapp_no: `${countryCode}${whatsappNo}`,
            }
          }
        });
        
        if (authError) throw authError;

        // Fail-safe: Manually ensure profile is created immediately
        if (authData.user) {
          await supabase.from("profiles").upsert({
            id: authData.user.id,
            full_name: fullName,
            handle: username.toLowerCase().replace(/\s+/g, ""),
            email: emailOrUsername,
            whatsapp_no: `${countryCode}${whatsappNo}`
          }, { onConflict: 'id' });
        }

        if (authData.session) {
          toast.success("Welcome to TapOpen!");
          navigate("/dashboard");
        } else {
          toast.success("Account created! Please check your email to confirm.");
          navigate("/auth/login");
        }
      } else {
        let loginEmail = emailOrUsername;

        // Smart Login: Resolve handle to email ONLY if no @ is present
        if (!emailOrUsername.includes("@")) {
          const { data: profile, error: lookupError } = await supabase
            .from("profiles")
            .select("email")
            .eq("handle", emailOrUsername.toLowerCase())
            .single();
          
          if (lookupError || !profile) {
            toast.error("No account found with that username. Try using your email.");
            return;
          }
          loginEmail = profile.email;
        }

        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password,
        });

        if (loginError) {
          if (loginError.message === "Invalid login credentials") {
            toast.error("Incorrect email or password.");
          } else {
            toast.error(loginError.message);
          }
          return;
        }

        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Abstract Background Accents */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />

      <Link to="/" className="flex items-center gap-2 mb-8 group transition-all hover:scale-105">
        <div className="w-9 h-9 gradient-bg rounded-xl flex items-center justify-center shadow-lg">
          <Zap className="text-primary-foreground h-5 w-5" />
        </div>
        <span className="text-xl font-display font-bold tracking-tighter">TapOpen</span>
      </Link>

      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 md:p-10 shadow-2xl relative">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-display font-bold mb-2">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "login" ? "Enter your credentials to access your dashboard." : "Join thousands of creators using deep links."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Unique Username</label>
              <div className="relative">
                <Layout className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="creator_handle"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-background border border-border focus:border-primary rounded-xl pl-12 pr-4 py-3.5 text-sm transition-all focus:outline-none"
                />
              </div>
            </div>
          )}

          {mode === "signup" && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-background border border-border focus:border-primary rounded-xl pl-12 pr-4 py-3.5 text-sm transition-all focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
              {mode === "login" ? "Gmail / Email Address" : "Email Address"}
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                placeholder={mode === "login" ? "yourname@gmail.com" : "name@example.com"}
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full bg-background border border-border focus:border-primary rounded-xl pl-12 pr-4 py-3.5 text-sm transition-all focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Password</label>
              {mode === "login" && (
                <Link to="#" className="text-[10px] font-bold text-primary uppercase tracking-wider hover:underline">Forgot?</Link>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border focus:border-primary rounded-xl pl-12 pr-4 py-3.5 text-sm transition-all focus:outline-none"
              />
            </div>
          </div>

          {mode === "signup" && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">WhatsApp Number</label>
              <div className="flex gap-2">
                <div className="relative shrink-0">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="appearance-none bg-background border border-border focus:border-primary rounded-xl pl-4 pr-10 py-3.5 text-sm transition-all focus:outline-none cursor-pointer"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                <div className="relative flex-1">
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={whatsappNo}
                    onChange={(e) => setWhatsappNo(e.target.value)}
                    className="w-full bg-background border border-border focus:border-primary rounded-xl px-4 py-3.5 text-sm transition-all focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full h-14 text-md font-bold" variant="gradient" disabled={isLoading}>
            {isLoading ? "Processing..." : (mode === "login" ? "Sign In" : "Get Started")}
            {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
          </Button>
        </form>

        <p className="text-center mt-10 text-sm text-muted-foreground">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <Link 
            to={mode === "login" ? "/auth/signup" : "/auth/login"} 
            className="text-primary font-bold hover:underline underline-offset-4"
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </Link>
        </p>
      </div>

      <p className="mt-12 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
        © 2025 TapOpen Inc. • <Link to="#" className="hover:text-primary">Terms</Link> • <Link to="#" className="hover:text-primary">Privacy</Link>
      </p>
    </div>
  );
};

export default AuthPage;
