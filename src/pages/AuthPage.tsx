import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Mail, Lock, ArrowRight, User, Layout, ChevronDown, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const AuthPage = ({ mode }: { mode: "login" | "signup" }) => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const getRedirectPath = () => {
    const savedRedirect = localStorage.getItem("tapopen_redirect");
    if (savedRedirect) {
      localStorage.removeItem("tapopen_redirect");
      return savedRedirect;
    }
    if (localStorage.getItem("pending_tapopen_link")) {
      return "/console/quick-links";
    }
    return "/console";
  };

  useEffect(() => {
    if (!supabase) return;
    const checkSession = async () => {
      if (window.location.hash.includes('access_token') || window.location.search.includes('code=')) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigate(getRedirectPath());
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) navigate(getRedirectPath());
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabase) {
      toast.error("Supabase is not configured. Please check your .env keys.");
      return;
    }

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
            }
          }
        });
        
        if (authError) throw authError;

        if (authData.user) {
          await supabase.from("profiles").upsert({
            id: authData.user.id,
            full_name: fullName,
            handle: username.toLowerCase().replace(/\s+/g, ""),
            email: emailOrUsername,
          }, { onConflict: 'id' });
        }

        if (authData.session) {
          toast.success("Welcome to TapOpen!");
          navigate(getRedirectPath());
        } else {
          toast.success("Account created! Please check your email to confirm.");
          navigate("/auth/login");
        }
      } else {
        let loginEmail = emailOrUsername;
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
        navigate(getRedirectPath());
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
        redirectTo: `${window.location.origin}/console/settings#security`,
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
        options: { redirectTo: `${window.location.origin}${getRedirectPath()}` }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Google Sign In failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      
      {/* ── Left Panel: Form ── */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          
          <Link to="/" className="inline-flex items-center gap-2 mb-10 group">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Zap className="text-white h-5 w-5" />
            </div>
            <span className="text-2xl font-black tracking-tight text-[#111827]">TapOpen</span>
          </Link>

          <div>
            <h2 className="text-3xl font-black tracking-tight text-[#111827]">
              {mode === "login" ? "Welcome back" : "Create an account"}
            </h2>
            <p className="mt-2 text-sm text-[#6B7280]">
              {mode === "login" 
                ? "Sign in to your account to manage your links and profile." 
                : "Join thousands of creators using deep links."}
            </p>
          </div>

          <div className="mt-8">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-[#E5E7EB] hover:bg-[#F8FAFC] hover:border-[#D1D5DB] rounded-xl text-sm font-bold text-[#111827] shadow-sm transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="mt-6 flex items-center">
              <div className="flex-1 border-t border-[#E5E7EB]"></div>
              <span className="mx-4 text-[10px] uppercase tracking-widest font-bold text-[#9CA3AF]">Or continue with email</span>
              <div className="flex-1 border-t border-[#E5E7EB]"></div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[#6B7280]">
                    Unique Username
                  </label>
                  <div className="relative">
                    <Layout className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                    <input
                      type="text"
                      required
                      placeholder="creator_handle"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] pl-10 pr-4 py-3 text-sm text-[#111827] placeholder-[#9CA3AF] focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                  </div>
                </div>
              )}

              {mode === "signup" && (
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[#6B7280]">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="block w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] pl-10 pr-4 py-3 text-sm text-[#111827] placeholder-[#9CA3AF] focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[#6B7280]">
                  {mode === "login" ? "Email or Username" : "Email Address"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                  <input
                    type={mode === "login" ? "text" : "email"}
                    required
                    placeholder={mode === "login" ? "yourname@gmail.com" : "name@example.com"}
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    className="block w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] pl-10 pr-4 py-3 text-sm text-[#111827] placeholder-[#9CA3AF] focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[#6B7280]">
                    Password
                  </label>
                  {mode === "login" && (
                    <button 
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={isLoading}
                      className="text-[11px] font-extrabold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] pl-10 pr-4 py-3 text-sm text-[#111827] placeholder-[#9CA3AF] focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 mt-2 bg-[#111827] hover:bg-black text-white rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-[#6B7280]">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <Link 
                to={mode === "login" ? "/auth/signup" : "/auth/login"} 
                className="font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                {mode === "login" ? "Sign up for free" : "Log in"}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Brand Graphic ── */}
      <div className="relative hidden w-0 flex-1 lg:block bg-[#0A0A0A] overflow-hidden">
        
        {/* Dynamic mesh gradient background */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-1000"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/30 rounded-full blur-[150px] mix-blend-screen"></div>
        </div>
        
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

        <div className="relative h-full flex flex-col justify-center px-20">
          <div className="mb-12 relative">
             <div className="absolute -inset-4 bg-white/10 blur-xl rounded-full"></div>
             <div className="relative flex items-center justify-center w-24 h-24 border border-white/20 bg-white/5 backdrop-blur-md rounded-3xl shadow-2xl">
               <Zap className="w-10 h-10 text-white" />
             </div>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight max-w-lg mb-6">
            The infrastructure for your digital identity.
          </h2>
          <p className="text-lg text-slate-400 max-w-md font-medium leading-relaxed">
            Create deep links that never break, build a stunning profile, and deploy forms in seconds. All natively integrated.
          </p>
          
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-semibold text-slate-300">Intelligent native app routing</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-semibold text-slate-300">Beautiful customizable profiles</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-sm font-semibold text-slate-300">Advanced click tracking & analytics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
