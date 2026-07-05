import { useParams } from "react-router-dom";
import { useRedirect } from "@/hooks/useRedirect";
import { platforms } from "@/lib/data";

// Components
import RedirectLoading from "@/components/redirect/RedirectLoading";
import ManualOpenPrompt from "@/components/redirect/ManualOpenPrompt";
import PublicProfile from "./PublicProfile";

const RedirectHandler = () => {
  const { slug } = useParams<{ slug: string }>();
  const { link, error, needsManualOpen, isProcessing } = useRedirect(slug);

  const detectedPlatform = link?.platform 
    ? platforms.find(p => p.name.toLowerCase() === link.platform.toLowerCase() || link.platform.toLowerCase().includes(p.name.toLowerCase()))
    : null;

  if (error) {
    // If it's not a short link, it might be a public profile handle!
    return <PublicProfile />;
  }

  if (needsManualOpen && link) {
    return <ManualOpenPrompt url={link.original_url} />;
  }

  // If processing and we don't have a link yet, show the standard TapOpen loader to avoid flashing black
  if (isProcessing && !link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-8">
          <div className="relative flex items-center justify-center w-20 h-20">
            <div className="absolute inset-0 border-[3px] border-[#E5E7EB] rounded-2xl rotate-45"></div>
            <div className="absolute inset-0 border-[3px] border-[#111827] rounded-2xl border-t-transparent border-r-transparent animate-spin"></div>
            <div className="w-4 h-4 bg-[#111827] rounded-sm rotate-45 animate-pulse"></div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-[#111827]">TapOpen</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Deep Link Loading View (Redirect is happening)
  // Instead of the black scanner screen, we continue showing the clean TapOpen loader
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-8">
        <div className="relative flex items-center justify-center w-20 h-20">
          <div className="absolute inset-0 border-[3px] border-[#E5E7EB] rounded-2xl rotate-45"></div>
          <div className="absolute inset-0 border-[3px] border-[#111827] rounded-2xl border-t-transparent border-r-transparent animate-spin"></div>
          <div className="w-4 h-4 bg-[#111827] rounded-sm rotate-45 animate-pulse"></div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight text-[#111827]">TapOpen</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedirectHandler;
