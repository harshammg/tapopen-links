import { useState, useEffect, useCallback } from "react";
import { linkService } from "@/services/linkService";
import { supabase } from "@/lib/supabase";
import { Link } from "@/types";
import { toast } from "sonner";

export const useLinks = () => {
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    fetchLinks();
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
    fetchLinks,
    createLink,
    updateLink,
    deleteLink
  };
};
