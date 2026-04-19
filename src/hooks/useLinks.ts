import { useState, useEffect, useCallback } from "react";
import { linkService } from "@/services/linkService";
import { supabase } from "@/lib/supabase";
import { Link } from "@/types";
import { toast } from "sonner";

export const useLinks = () => {
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [newlyCreatedSlugs, setNewlyCreatedSlugs] = useState<string[]>([]);

  const fetchLinks = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const data = await linkService.getLinks(session.user.id);
      setLinks(data);
    } catch (error: any) {
      console.error("Failed to fetch links:", error);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;

    let isProcessingClaim = false;

    const claimPendingLink = async (session: any) => {
      const pendingLinkRaw = localStorage.getItem("pending_tapopen_link");
      if (!pendingLinkRaw || !session?.user || isProcessingClaim) {
        fetchLinks();
        return;
      }

      isProcessingClaim = true;
      try {
        const pendingLink = JSON.parse(pendingLinkRaw);
        localStorage.removeItem("pending_tapopen_link");

        // Small delay to ensure database profile trigger finishes on first-time usage
        await new Promise(r => setTimeout(r, 1000));

        try {
          await linkService.createLink({
            original_url: pendingLink.original_url,
            platform: pendingLink.platform,
            slug: pendingLink.slug,
            user_id: session.user.id,
            clicks: 0
          });
          setNewlyCreatedSlugs(prev => [...prev, pendingLink.slug]);
          toast.success("Successfully claimed your link!");
        } catch (err: any) {
          if (err?.code === '23505') {
            const randomSlug = `${pendingLink.slug}-${Math.random().toString(36).substring(2, 6)}`;
            await linkService.createLink({
              original_url: pendingLink.original_url,
              platform: pendingLink.platform,
              slug: randomSlug,
              user_id: session.user.id,
              clicks: 0
            });
            setNewlyCreatedSlugs(prev => [...prev, randomSlug]);
            toast.success("Linked claimed with a unique alias!");
          }
        }
      } catch (e) {
        console.error("Claim error:", e);
      } finally {
        isProcessingClaim = false;
        fetchLinks();
      }
    };

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) claimPendingLink(session);
      else fetchLinks();
    });

    // Listen for auth state changes (crucial for first-time signups/logins)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        claimPendingLink(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchLinks]);

  const createLink = async (linkData: Partial<Link>) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      await linkService.createLink({
        ...linkData,
        user_id: session.user.id,
        clicks: 0
      });

      if (linkData.slug) {
        setNewlyCreatedSlugs(prev => [...prev, linkData.slug!]);
      }

      toast.success("Link generated successfully!");
      fetchLinks();
      return { success: true };
    } catch (error: any) {
      if (error?.code === '23505') {
        return { success: false, error: 'CONFLICT' };
      }
      toast.error(error.message || "Failed to generate link");
      return { success: false, error: 'OTHER' };
    } finally {
      setIsLoading(false);
    }
  };

  const updateLink = async (slug: string, updates: Partial<Link>) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      await linkService.updateLink(slug, session.user.id, updates);
      toast.success("Link updated successfully!");
      fetchLinks();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to update link");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLink = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      await linkService.deleteLink(slug, session.user.id);
      toast.success("Link deleted successfully");
      fetchLinks();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete link");
    }
  };

  return {
    links,
    isLoading,
    newlyCreatedSlugs,
    fetchLinks,
    createLink,
    updateLink,
    deleteLink
  };
};
