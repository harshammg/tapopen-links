import { supabase } from "@/lib/supabase";
import { Link } from "@/types";

export const linkService = {
  async getLinks(userId: string) {
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data as Link[];
  },

  async getLinkBySlug(slug: string) {
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .eq("slug", slug)
      .single();
    
    if (error) throw error;
    return data as Link;
  },

  async createLink(linkData: Partial<Link>) {
    const { data, error } = await supabase
      .from("links")
      .insert([linkData])
      .select()
      .single();
    
    if (error) throw error;
    return data as Link;
  },

  async updateLink(slug: string, userId: string, updates: Partial<Link>) {
    const { data, error } = await supabase
      .from("links")
      .update(updates)
      .eq("slug", slug)
      .eq("user_id", userId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Link;
  },

  async deleteLink(slug: string, userId: string) {
    const { error } = await supabase
      .from("links")
      .delete()
      .eq("slug", slug)
      .eq("user_id", userId);
    
    if (error) throw error;
  },

  async recordClick(slug: string, currentTotal: number, currentDaily: Record<string, number>) {
    const today = new Date().toISOString().split('T')[0];
    const updatedDaily = {
      ...currentDaily,
      [today]: (currentDaily[today] || 0) + 1
    };

    const { error } = await supabase
      .from("links")
      .update({ 
        clicks: (currentTotal || 0) + 1,
        clicks_daily: updatedDaily,
        last_accessed_at: new Date().toISOString() 
      })
      .eq("slug", slug);
    
    if (error) throw error;
  }
};
