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

  // Default Loading View (Redirect is happening or data is fetching)
  return (
    <RedirectLoading 
      platform={link?.platform || null} 
      detectedPlatform={detectedPlatform} 
    />
  );
};

export default RedirectHandler;
