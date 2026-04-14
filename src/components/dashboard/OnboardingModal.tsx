import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Layout, ArrowRight, ChevronDown, SkipForward } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { nanoid } from "nanoid";

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

interface OnboardingModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  user: any;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onSuccess, user }) => {
  const [username, setUsername] = useState("");
  const [whatsappNo, setWhatsappNo] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setUsername(user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ''));
    }
  }, [user]);

  const handleSubmit = async (e?: React.FormEvent, skip: boolean = false) => {
    if (e) e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    try {
      const finalHandle = skip 
        ? `user_${nanoid(8).toLowerCase()}` 
        : username.toLowerCase().replace(/\s+/g, "");
      
      // Check if handle is taken (only if not skipping)
      if (!skip) {
        if (whatsappNo) {
          const phoneRegex = /^\d{6,15}$/;
          if (!phoneRegex.test(whatsappNo.replace(/\s+/g, ''))) {
            toast.error("Please enter a valid phone number (6-15 digits, numbers only).");
            setIsLoading(false);
            return;
          }
        }

        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("handle", finalHandle)
          .neq("id", user.id)
          .single();
          
        if (existing) {
          toast.error("That username is already taken.");
          setIsLoading(false);
          return;
        }
      }

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: user.user_metadata?.full_name || (skip ? "User" : username),
        handle: finalHandle,
        email: user.email,
        whatsapp_no: skip ? null : (whatsappNo ? `${countryCode}${whatsappNo}` : null)
      }, { onConflict: 'id' });

      if (error) throw error;

      toast.success(skip ? "Setup skipped!" : "Profile setup complete!");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl rounded-3xl p-0 overflow-hidden hide-close-button" onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <div className="bg-primary/5 p-6 md:p-8 border-b border-border text-center relative">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-bold">Almost There</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Choose your unique username to complete your profile.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6 md:p-8 space-y-6">
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-5">
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

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">WhatsApp Number (Optional)</label>
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
                    placeholder="9876543210"
                    value={whatsappNo}
                    onChange={(e) => setWhatsappNo(e.target.value)}
                    className="w-full bg-background border border-border focus:border-primary rounded-xl px-4 py-3.5 text-sm transition-all focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-8">
              <Button type="submit" className="w-full h-14 text-md font-bold" variant="gradient" disabled={isLoading}>
                {isLoading ? "Saving..." : "Complete Setup"}
                {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full text-muted-foreground hover:text-foreground"
                disabled={isLoading}
                onClick={() => handleSubmit(undefined, true)}
              >
                Skip for now <SkipForward className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
