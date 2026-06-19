import React, { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Trash2, Layout, Loader2, Save, Globe, User, Mail, MapPin, Eye, Plus, ShoppingBag, GripVertical, Search, ArrowRight
} from "lucide-react";
import { linkService } from "@/services/linkService";
import { toast } from "sonner";
import { Reorder, useDragControls } from "framer-motion";
import { LivePreview } from "@/components/dashboard/LivePreview";
import AnalyticsModal from "@/components/dashboard/AnalyticsModal";

const LinkItem = ({ link, onToggleCategory, onDelete, onAnalytics }: any) => {
  const dragControls = useDragControls();
  const isHeader = link.type === "header";
  const isStore = link.category === "store";

  return (
    <Reorder.Item 
      key={link.id} 
      value={link}
      dragListener={false}
      dragControls={dragControls}
      whileDrag={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      className={`bg-card border ${isHeader ? (isStore ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-primary/30 bg-primary/5') : (isStore ? 'border-emerald-500/20' : 'border-border')} rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm hover:border-primary/30 transition-shadow`}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <div 
            className="p-2 cursor-grab active:cursor-grabbing hover:bg-muted rounded-lg transition-colors"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <GripVertical className={`w-4 h-4 ${isStore ? 'text-emerald-500/40' : 'text-muted-foreground/30'}`} />
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isHeader ? (isStore ? 'bg-emerald-500 text-white' : 'bg-primary text-white') : (isStore ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground')}`}>
            {isStore ? <ShoppingBag className="w-5 h-5" /> : <Layout className="w-5 h-5" />}
          </div>
        </div>
        <div className={`min-w-0 ${isHeader ? 'flex-1 text-center pr-10' : ''}`}>
          <p className={`font-bold ${isHeader ? 'text-xs uppercase tracking-widest' : 'text-sm'} truncate`}>{link.title}</p>
          {!isHeader && <p className="text-xs text-muted-foreground truncate opacity-70">{link.url}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {!isHeader && (
          <button 
            onClick={() => onAnalytics(link)}
            className="flex items-center gap-1.5 bg-muted/30 hover:bg-primary/10 px-3 py-1.5 rounded-xl transition-all group mr-2"
            title="View Analytics"
          >
            <span className="text-sm font-black text-primary">{link.clicks || 0}</span>
            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest group-hover:text-primary transition-colors">
              Clicks
            </span>
          </button>
        )}
        <button 
          onClick={() => onToggleCategory(link.id, link.category)} 
          className={`p-2.5 rounded-xl transition-colors ${isStore ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-muted-foreground hover:bg-muted'}`}
          title={isStore ? "Move to Links" : "Move to Store"}
        >
          {isStore ? <Layout className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
        </button>
        <button onClick={() => onDelete(link.id)} className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </Reorder.Item>
  );
};

interface Link {
  id: string;
  title: string;
  url: string;
  originalUrl?: string;
  type: "regular" | "affiliate" | "header";
  category: "links" | "store";
  active: boolean;
  is_pinned?: boolean;
  slug?: string;
  sort_order?: number;
  clicks?: number;
  clicks_daily?: Record<string, number>;
}

export const LinkPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [links, setLinks] = useState<Link[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [newLink, setNewLink] = useState<Partial<Link>>({ title: "", url: "", type: "regular", category: "links" });
  const [newHeader, setNewHeader] = useState<Partial<Link>>({ title: "", type: "header", category: "links" });
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [linksSearch, setLinksSearch] = useState("");
  const [storeSearch, setStoreSearch] = useState("");
  const [analysisLink, setAnalysisLink] = useState<Link | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (profileData) setProfile(profileData);
        
        const { data: linkData } = await supabase.from("links").select("*").eq("user_id", session.user.id).or("is_quick.is.null,is_quick.eq.false").order("sort_order", { ascending: true });
        if (linkData) {
          setLinks(linkData.map(l => ({
            id: l.id, title: l.title || "",
            url: l.slug ? `${window.location.origin}/${l.slug}` : l.original_url,
            originalUrl: l.original_url, type: l.type as any, category: (l.category as any) || "links",
            active: l.active !== false, is_pinned: !!l.is_pinned, slug: l.slug, sort_order: l.sort_order,
            clicks: l.clicks || 0, clicks_daily: l.clicks_daily || {}
          })));
        }

        const { data: portData } = await supabase.from("portfolio_items").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
        if (portData) setPortfolio(portData);

        const { data: blogData } = await supabase.from("blog_posts").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
        if (blogData) setBlogs(blogData);

      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const addLink = async () => {
    if (!newLink.title) return toast.error("Title required");
    setIsCreatingLink(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const slug = nanoid(6);
      const created = await linkService.createLink({
        original_url: newLink.url || "", slug, user_id: session.user.id,
        title: newLink.title as string, type: "regular", category: newLink.category || "links",
        active: true, sort_order: links.length
      });
      setLinks([...links, {
        id: created.id, title: newLink.title as string,
        url: `${window.location.origin}/${created.slug}`, originalUrl: newLink.url,
        type: "regular", category: (newLink.category as any) || "links", active: true, slug: created.slug, sort_order: links.length
      }]);
      setNewLink({ title: "", url: "", type: "regular", category: "links" });
      toast.success("Link added!");
    } catch (err) { toast.error("Failed to add link"); } finally { setIsCreatingLink(false); }
  };

  const addHeader = async () => {
    if (!newHeader.title) return toast.error("Header title required");
    setIsCreatingLink(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const slug = `header-${nanoid(6)}`;
      const created = await linkService.createLink({
        original_url: "", slug, user_id: session.user.id,
        title: newHeader.title as string, type: "header", category: newHeader.category || "links",
        active: true, sort_order: links.length
      });
      setLinks([...links, {
        id: created.id, title: newHeader.title as string,
        url: "", originalUrl: "",
        type: "header", category: (newHeader.category as any) || "links", active: true, slug: created.slug, sort_order: links.length
      }]);
      setNewHeader({ title: "", type: "header", category: "links" });
      toast.success("Header added!");
    } catch (err) { toast.error("Failed to add header"); } finally { setIsCreatingLink(false); }
  };

  const toggleCategory = async (id: string, currentCategory: string) => {
    const newCategory = currentCategory === "links" ? "store" : "links";
    try {
      await supabase.from("links").update({ category: newCategory }).eq("id", id);
      setLinks(links.map(l => (l.id === id ? { ...l, category: newCategory as any } : l)));
      toast.success(`Moved to ${newCategory === "links" ? "Links" : "Store"}`);
    } catch (err) { toast.error("Failed to update category"); }
  };

  const deleteLink = async (id: string) => {
    const link = links.find(l => l.id === id);
    if (!link) return;
    setLinks(prev => prev.filter(l => l.id !== id));
    if (link.slug) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) await linkService.deleteLink(link.slug, session.user.id);
    }
  };

  const updateSortOrder = async (linksToSave: Link[] = links) => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Perform updates in parallel for better reliability
      const updatePromises = linksToSave.map((link, index) => {
        if (!link.id) return Promise.resolve();
        return supabase
          .from("links")
          .update({ sort_order: index })
          .eq("id", link.id)
          .eq("user_id", session.user.id);
      });

      const results = await Promise.all(updatePromises);
      const errors = results.filter(r => r && r.error);
      
      if (errors.length > 0) throw new Error("Some updates failed");

      toast.success("Order automatically saved!");
    } catch (err) {
      console.error("Save Order Error:", err);
      toast.error("Failed to save order. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const onReorder = (newSectionItems: Link[], category: "links" | "store") => {
    const otherSectionItems = links.filter(l => {
      const isLink = !l.category || l.category === "links";
      return category === "links" ? !isLink : isLink;
    });
    
    let finalLinks: Link[] = [];
    if (category === "links") {
      finalLinks = [...newSectionItems, ...otherSectionItems];
    } else {
      finalLinks = [...otherSectionItems, ...newSectionItems];
    }
    
    setLinks(finalLinks);
    updateSortOrder(finalLinks);
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  const standardLinks = links.filter(l => !l.category || l.category === "links");
  const storeLinks = links.filter(l => l.category === "store");

  return (
    <>
      {/* Mobile Preview Overlay */}
      {showMobilePreview && (
        <div className="fixed inset-0 z-[100] bg-background xl:hidden flex flex-col items-center justify-center p-6">
          <Button 
            className="absolute top-6 left-1/2 -translate-x-1/2 z-[110] rounded-full shadow-2xl font-bold tracking-widest uppercase text-[10px]"
            onClick={() => setShowMobilePreview(false)}
            variant="secondary"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Back to Editor
          </Button>
          <div className="mt-16 w-full max-w-sm">
            <LivePreview 
              profile={profile} 
              links={links} 
              portfolio={portfolio} 
              blogs={blogs} 
              initialSection="links"
              hideTabs={true}
            />
          </div>
        </div>
      )}

      {/* Mobile Floating Button */}
      {!showMobilePreview && (
        <Button 
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[40] xl:hidden rounded-full shadow-2xl font-bold tracking-widest uppercase text-[10px]"
          onClick={() => setShowMobilePreview(true)}
        >
          <Eye className="w-4 h-4 mr-2" /> View Live Preview
        </Button>
      )}

      <div className="flex flex-col xl:flex-row justify-center gap-[32px] px-4 md:px-6 py-8 md:py-12 pb-32 max-w-[1000px] mx-auto w-full">
        
        {/* ---------------- CENTER FEED CONTENT (max 600px) ---------------- */}
        <div className="flex-1 w-full max-w-[600px] mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 md:mb-12">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">My Links</h1>
              <p className="text-sm md:text-base text-muted-foreground">Manage your URLs, socials, and store items.</p>
            </div>
          </div>
          {/* Add Link Form */}
          <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm space-y-8">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Plus className="w-3 h-3" /> Add Standard Link
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="md:col-span-2">
                  <Input 
                    value={newLink.type !== 'header' ? newLink.title : ""} 
                    onChange={e => setNewLink({...newLink, title: e.target.value, type: 'regular'})} 
                    placeholder="Title (e.g. Portfolio)" 
                    className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <Input 
                    value={newLink.type !== 'header' ? newLink.url : ""} 
                    onChange={e => setNewLink({...newLink, url: e.target.value, type: 'regular'})} 
                    placeholder="URL (https://...)" 
                    className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-all"
                  />
                </div>
                <Button onClick={addLink} className="h-12 rounded-xl font-bold" disabled={isCreatingLink}>
                  {isCreatingLink ? <Loader2 className="animate-spin h-4 w-4" /> : <Plus className="h-4 w-4 mr-2" />}
                  Add Link
                </Button>
              </div>
              {/* Category selector for link */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Add to:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewLink({...newLink, category: 'links'})}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                      (newLink.category === 'links' || !newLink.category)
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <Layout className="w-3 h-3" /> Links
                  </button>
                  <button
                    onClick={() => setNewLink({...newLink, category: 'store'})}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                      newLink.category === 'store'
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                        : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <ShoppingBag className="w-3 h-3" /> Store
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border/50 space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Layout className="w-3 h-3" /> Add Section Header
              </h3>
              <div className="flex gap-3">
                <Input 
                  value={newHeader.title || ""} 
                  onChange={e => setNewHeader({...newHeader, title: e.target.value})} 
                  placeholder="Header Title (e.g. My Projects, Social Links...)" 
                  className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && addHeader()}
                />
                <Button 
                  variant="outline"
                  onClick={addHeader} 
                  className="h-12 px-6 rounded-xl font-bold border-2 hover:bg-primary hover:text-white hover:border-primary transition-all shrink-0" 
                  disabled={isCreatingLink}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Header
                </Button>
              </div>
              {/* Category selector for header */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Add to:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewHeader({...newHeader, category: 'links'})}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                      (newHeader.category === 'links' || !newHeader.category)
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <Layout className="w-3 h-3" /> Links
                  </button>
                  <button
                    onClick={() => setNewHeader({...newHeader, category: 'store'})}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                      newHeader.category === 'store'
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                        : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <ShoppingBag className="w-3 h-3" /> Store
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div className="space-y-12">
            {/* Standard Links */}
            <div className="space-y-4">
              <div className="flex items-center justify-between ml-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <Layout className="w-4 h-4" /> Standard Links
                  {linksSearch && <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{standardLinks.filter(l => l.title.toLowerCase().includes(linksSearch.toLowerCase())).length} results</span>}
                </h3>
              </div>
              {/* Links Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                <Input
                  value={linksSearch}
                  onChange={e => setLinksSearch(e.target.value)}
                  placeholder="Search links..."
                  className="h-9 pl-9 rounded-xl bg-muted/40 border-transparent text-xs focus:bg-background transition-all"
                />
              </div>
              {standardLinks.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-border rounded-[2.5rem] text-muted-foreground text-xs italic">
                  No standard links yet.
                </div>
              ) : (
                <Reorder.Group axis="y" values={standardLinks} onReorder={(vals) => onReorder(vals, "links")} className="space-y-3">
                  {standardLinks
                    .filter(l => !linksSearch || l.title.toLowerCase().includes(linksSearch.toLowerCase()))
                    .map((link) => (
                      <LinkItem 
                        key={link.id} 
                        link={link} 
                        onToggleCategory={toggleCategory}
                        onDelete={deleteLink}
                        onAnalytics={setAnalysisLink}
                      />
                    ))}
                </Reorder.Group>
              )}
            </div>

            {/* Digital Store */}
            <div className="space-y-4">
              <div className="flex items-center justify-between ml-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" /> Digital Store Items
                  {storeSearch && <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">{storeLinks.filter(l => l.title.toLowerCase().includes(storeSearch.toLowerCase())).length} results</span>}
                </h3>
              </div>
              {/* Store Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                <Input
                  value={storeSearch}
                  onChange={e => setStoreSearch(e.target.value)}
                  placeholder="Search store items..."
                  className="h-9 pl-9 rounded-xl bg-emerald-500/5 border-emerald-500/10 text-xs focus:bg-background transition-all"
                />
              </div>
              {storeLinks.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-emerald-500/10 rounded-[2.5rem] text-muted-foreground text-xs italic bg-emerald-500/5">
                  Your store is currently empty.
                </div>
              ) : (
                <Reorder.Group axis="y" values={storeLinks} onReorder={(vals) => onReorder(vals, "store")} className="space-y-3">
                  {storeLinks
                    .filter(l => !storeSearch || l.title.toLowerCase().includes(storeSearch.toLowerCase()))
                    .map((link) => (
                      <LinkItem 
                        key={link.id} 
                        link={link} 
                        onToggleCategory={toggleCategory}
                        onDelete={deleteLink}
                        onAnalytics={setAnalysisLink}
                      />
                    ))}
                </Reorder.Group>
              )}
            </div>
          </div>
        </div>

        {/* ---------------- RIGHT STICKY PANEL (320px) ---------------- */}
        <div className="hidden xl:block w-[320px] shrink-0 relative">
          <div className="sticky top-8 space-y-6 flex flex-col items-center glass-panel p-6 pb-8">
            <div className="text-center w-full">
              <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-2">Live Preview</h3>
              <p className="text-[10px] text-muted-foreground">See your changes in real-time</p>
            </div>
            <LivePreview 
              profile={profile} 
              links={links} 
              portfolio={portfolio} 
              blogs={blogs} 
              initialSection="links"
              hideTabs={true}
            />
            {isSaving && (
              <div className="flex items-center justify-center gap-2 text-primary font-black text-[10px] uppercase animate-pulse bg-primary/5 w-full py-3 rounded-2xl border border-primary/10">
                <Loader2 className="w-3 h-3 animate-spin" /> Auto-Saving...
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Analytics Modal */}
      <AnalyticsModal 
        isOpen={!!analysisLink} 
        onClose={() => setAnalysisLink(null)} 
        link={analysisLink as any} 
      />
    </>
  );
};
