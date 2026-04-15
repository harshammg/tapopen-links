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
      if (window.location.hash.includes('access_token') || window.location.search.includes('code=')) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigate("/dashboard");
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) navigate("/dashboard");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabase) {
      toast.error("Supabase is not configured. Please check your .env keys.");
      return;
    }

    // Add comprehensive validation for manual signups
    if (mode === "signup") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailOrUsername)) {
        toast.error("Please enter a valid email address.");
        return;
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_~\-]).{8,}$/;
      if (!passwordRegex.test(password)) {
        toast.error("Password must be at least 8 characters, include an uppercase letter, a lowercase letter, and a special character.");
        return;
      }

      const phoneRegex = /^\d{6,15}$/;
      if (!phoneRegex.test(whatsappNo.replace(/\s+/g, ''))) {
        toast.error("Please enter a valid phone number (6-15 digits, numbers only).");
        return;
      }
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



  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!emailOrUsername || !emailOrUsername.includes('@')) {
      toast.error("Please enter your email address in the field above to receive a reset link.");
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailOrUsername, {
        redirectTo: `${window.location.origin}/dashboard/settings#security`,
      });
      if (error) throw error;
      toast.success("Password reset instructions sent! Check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard` }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Google Sign In failed");
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

          {/* Google OAuth Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-14 rounded-xl font-bold text-sm bg-background hover:bg-muted transition-colors flex items-center justify-center gap-3 border-border"
            onClick={handleGoogleLogin}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>

          <div className="flex items-center gap-4">
            <div className="h-px bg-border flex-1" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Or</span>
            <div className="h-px bg-border flex-1" />
          </div>

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
                <button 
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                  className="text-[10px] font-bold text-primary uppercase tracking-wider hover:underline disabled:opacity-50"
                >
                  Forgot?
                </button>
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
