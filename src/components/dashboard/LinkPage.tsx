import React, { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Trash2, Layout, Loader2, Save, Globe, User, Mail, MapPin, Eye, Plus, ShoppingBag, GripVertical
} from "lucide-react";
import { linkService } from "@/services/linkService";
import { toast } from "sonner";
import { Reorder, useDragControls } from "framer-motion";
import { LivePreview } from "@/components/dashboard/LivePreview";

const LinkItem = ({ link, onToggleCategory, onDelete }: any) => {
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
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2">
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
      <div className="flex items-center gap-3">
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
}

export const LinkPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [links, setLinks] = useState<Link[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [newLink, setNewLink] = useState<Partial<Link>>({ title: "", url: "", type: "regular", category: "links" });
  const [isCreatingLink, setIsCreatingLink] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (profileData) setProfile(profileData);
        
        const { data: linkData } = await supabase.from("links").select("*").eq("user_id", session.user.id).order("sort_order", { ascending: true });
        if (linkData) {
          setLinks(linkData.map(l => ({
            id: l.id, title: l.title || "",
            url: l.slug ? `${window.location.origin}/${l.slug}` : l.original_url,
            originalUrl: l.original_url, type: l.type as any, category: (l.category as any) || "links",
            active: l.active !== false, is_pinned: !!l.is_pinned, slug: l.slug, sort_order: l.sort_order
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
        title: newLink.title as string, type: newLink.type || "regular", category: newLink.category || "links",
        active: true, sort_order: links.length
      });
      setLinks([...links, {
        id: created.id, title: newLink.title as string,
        url: `${window.location.origin}/${created.slug}`, originalUrl: newLink.url,
        type: (newLink.type as any) || "regular", category: (newLink.category as any) || "links", active: true, slug: created.slug, sort_order: links.length
      }]);
      setNewLink({ title: "", url: "", type: "regular", category: "links" });
      toast.success("Link added!");
    } catch (err) { toast.error("Failed to add link"); } finally { setIsCreatingLink(false); }
  };

  const addHeader = async () => {
    if (!newLink.title) return toast.error("Header title required");
    setIsCreatingLink(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const slug = `header-${nanoid(6)}`;
      const created = await linkService.createLink({
        original_url: "", slug, user_id: session.user.id,
        title: newLink.title as string, type: "header", category: newLink.category || "links",
        active: true, sort_order: links.length
      });
      setLinks([...links, {
        id: created.id, title: newLink.title as string,
        url: "", originalUrl: "",
        type: "header", category: (newLink.category as any) || "links", active: true, slug: created.slug, sort_order: links.length
      }]);
      setNewLink({ title: "", url: "", type: "regular", category: "links" });
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

  const [hasChanges, setHasChanges] = useState(false);

  const updateSortOrder = async () => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Perform updates in parallel for better reliability
      const updatePromises = links.map((link, index) => {
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

      setHasChanges(false);
      toast.success("Order saved successfully!");
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
    setHasChanges(true);
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  const standardLinks = links.filter(l => !l.category || l.category === "links");
  const storeLinks = links.filter(l => l.category === "store");

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 pb-32">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">My Links</h1>
          <p className="text-muted-foreground">Manage your URLs, socials, and store items.</p>
        </div>
        <div className="flex gap-4">
          {hasChanges && (
            <Button 
              onClick={updateSortOrder} 
              disabled={isSaving}
              className="h-12 px-8 rounded-2xl shadow-xl shadow-primary/20 animate-in fade-in slide-in-from-right-4 duration-300"
            >
              {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
              Save Order
            </Button>
          )}
          <Button 
            variant="outline" 
            className="h-12 px-6 rounded-2xl"
            onClick={() => window.open(`/${profile?.handle}/links`, "_blank")}
          >
            <Eye className="w-4 h-4 mr-2" /> View Public Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
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
            </div>

            <div className="pt-6 border-t border-border/50 space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Layout className="w-3 h-3" /> Add Section Header
              </h3>
              <div className="flex gap-3">
                <Input 
                  value={newLink.type === 'header' ? newLink.title : ""} 
                  onChange={e => setNewLink({...newLink, title: e.target.value, type: 'header'})} 
                  placeholder="Header Title (e.g. My Projects, Social Links...)" 
                  className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && newLink.type === 'header' && addHeader()}
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
            </div>
          </div>

          {/* Links Sections */}
          <div className="space-y-12">
            {/* Standard Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-primary ml-2 flex items-center gap-2">
                <Layout className="w-4 h-4" /> Standard Links
              </h3>
              {standardLinks.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-border rounded-[2.5rem] text-muted-foreground text-xs italic">
                  No standard links yet.
                </div>
              ) : (
                <Reorder.Group axis="y" values={standardLinks} onReorder={(vals) => onReorder(vals, "links")} className="space-y-3">
                  {standardLinks.map((link) => (
                    <LinkItem 
                      key={link.id} 
                      link={link} 
                      onToggleCategory={toggleCategory}
                      onDelete={deleteLink}
                    />
                  ))}
                </Reorder.Group>
              )}
            </div>

            {/* Digital Store */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-emerald-500 ml-2 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Digital Store Items
              </h3>
              {storeLinks.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-emerald-500/10 rounded-[2.5rem] text-muted-foreground text-xs italic bg-emerald-500/5">
                  Your store is currently empty.
                </div>
              ) : (
                <Reorder.Group axis="y" values={storeLinks} onReorder={(vals) => onReorder(vals, "store")} className="space-y-3">
                  {storeLinks.map((link) => (
                    <LinkItem 
                      key={link.id} 
                      link={link} 
                      onToggleCategory={toggleCategory}
                      onDelete={deleteLink}
                    />
                  ))}
                </Reorder.Group>
              )}
            </div>
          </div>
        </div>

        {/* Right: Real-time Live Preview */}
        <div className="lg:col-span-4 sticky top-24 hidden lg:block">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-2">Live Preview</h3>
              <p className="text-[10px] text-muted-foreground">Changes reflect instantly</p>
            </div>
            <LivePreview 
              key={`preview-${links.length}-${links[0]?.id || 'empty'}`}
              profile={profile} 
              links={links} 
              portfolio={portfolio} 
              blogs={blogs} 
              initialSection="links"
              hideTabs={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
