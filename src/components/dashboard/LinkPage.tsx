import React, { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Trash2, Layout, Loader2, Save, Globe, User, Mail, MapPin, Eye, Plus, ShoppingBag, GripVertical, Search, ArrowRight, ExternalLink, Copy
} from "lucide-react";
import { linkService } from "@/services/linkService";
import { toast } from "sonner";
import { Reorder, useDragControls } from "framer-motion";
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
      whileDrag={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
      className={`bg-white border ${isHeader ? 'border-[#E5E7EB] bg-[#F8FAFC]' : 'border-[#E5E7EB]'} rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-[#D1D5DB] transition-all mb-3`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <div 
            className="p-1.5 cursor-grab active:cursor-grabbing hover:bg-[#F8FAFC] rounded-lg transition-colors"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <GripVertical className="w-4 h-4 text-[#9CA3AF]" />
          </div>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isHeader ? (isStore ? 'bg-blue-600 text-white' : 'bg-[#111827] text-white') : (isStore ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-[#F8FAFC] text-[#6B7280] border border-[#E5E7EB]')}`}>
            {isStore ? <ShoppingBag className="w-4 h-4" /> : <Layout className="w-4 h-4" />}
          </div>
        </div>
        <div className={`min-w-0 ${isHeader ? 'flex-1' : ''}`}>
          <p className={`font-bold text-[#111827] ${isHeader ? 'text-xs uppercase tracking-widest' : 'text-sm'} truncate`}>{link.title}</p>
          {!isHeader && <p className="text-xs text-[#6B7280] truncate opacity-90 mt-0.5">{link.url}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {!isHeader && (
          <button 
            onClick={() => onAnalytics(link)}
            className="flex items-center gap-1.5 bg-[#F8FAFC] hover:bg-blue-50 hover:text-blue-600 px-3 py-1.5 rounded-lg border border-[#E5E7EB] hover:border-blue-200 transition-all group"
            title="View Analytics"
          >
            <span className="text-sm font-black text-[#111827] group-hover:text-blue-600">{link.clicks || 0}</span>
            <span className="text-[9px] uppercase font-bold text-[#6B7280] tracking-widest group-hover:text-blue-600">
              Clicks
            </span>
          </button>
        )}
        <div className="h-4 w-px bg-[#E5E7EB] mx-1 hidden md:block"></div>
        <button 
          onClick={() => onToggleCategory(link.id, link.category)} 
          className={`p-2 rounded-lg transition-colors ${isStore ? 'text-blue-600 hover:bg-blue-50' : 'text-[#6B7280] hover:bg-[#F8FAFC]'}`}
          title={isStore ? "Move to Links" : "Move to Store"}
        >
          {isStore ? <Layout className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
        </button>
        <button onClick={() => onDelete(link.id)} className="p-2 text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
    <div className="bg-[#F8FAFC] min-h-screen">


      <div className="flex flex-col xl:flex-row justify-center gap-[32px] px-4 md:px-6 py-8 md:py-12 pb-32 max-w-[1100px] mx-auto w-full">
        
        {/* ---------------- CENTER FEED CONTENT (max 650px) ---------------- */}
        <div className="flex-1 w-full max-w-[650px] mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight mb-2">My Links</h1>
              <p className="text-sm text-[#6B7280] font-medium">Manage your URLs, socials, and store items.</p>
            </div>
          </div>
          {/* Add Link Form */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] flex items-center gap-2">
                <Plus className="w-3.5 h-3.5" /> Add Standard Link
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="md:col-span-2">
                  <Input 
                    value={newLink.type !== 'header' ? newLink.title : ""} 
                    onChange={e => setNewLink({...newLink, title: e.target.value, type: 'regular'})} 
                    placeholder="Title (e.g. Portfolio)" 
                    className="h-11 rounded-xl bg-white border-[#E5E7EB] text-sm text-[#111827] focus:border-blue-500 placeholder:text-[#9CA3AF]"
                  />
                </div>
                <div className="md:col-span-2">
                  <Input 
                    value={newLink.type !== 'header' ? newLink.url : ""} 
                    onChange={e => setNewLink({...newLink, url: e.target.value, type: 'regular'})} 
                    placeholder="URL (https://...)" 
                    className="h-11 rounded-xl bg-white border-[#E5E7EB] text-sm text-[#111827] focus:border-blue-500 placeholder:text-[#9CA3AF]"
                  />
                </div>
                <Button onClick={addLink} className="h-11 rounded-xl font-bold bg-[#111827] hover:bg-black text-white shadow-none" disabled={isCreatingLink}>
                  {isCreatingLink ? <Loader2 className="animate-spin h-4 w-4" /> : <Plus className="h-4 w-4 mr-1.5" />}
                  Add Link
                </Button>
              </div>
              {/* Category selector for link */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Add to:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewLink({...newLink, category: 'links'})}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      (newLink.category === 'links' || !newLink.category)
                        ? 'bg-[#111827] text-white border-[#111827]'
                        : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <Layout className="w-3.5 h-3.5" /> Links
                  </button>
                  <button
                    onClick={() => setNewLink({...newLink, category: 'store'})}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      newLink.category === 'store'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Store
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-[#E5E7EB] space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] flex items-center gap-2">
                <Layout className="w-3.5 h-3.5" /> Add Section Header
              </h3>
              <div className="flex gap-3">
                <Input 
                  value={newHeader.title || ""} 
                  onChange={e => setNewHeader({...newHeader, title: e.target.value})} 
                  placeholder="Header Title (e.g. My Projects, Socials...)" 
                  className="h-11 rounded-xl bg-white border-[#E5E7EB] text-sm text-[#111827] focus:border-blue-500 placeholder:text-[#9CA3AF] flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && addHeader()}
                />
                <Button 
                  variant="outline"
                  onClick={addHeader} 
                  className="h-11 px-5 rounded-xl font-bold border-[#E5E7EB] text-[#111827] hover:bg-[#F8FAFC] shrink-0 shadow-none" 
                  disabled={isCreatingLink}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Header
                </Button>
              </div>
              {/* Category selector for header */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Add to:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewHeader({...newHeader, category: 'links'})}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      (newHeader.category === 'links' || !newHeader.category)
                        ? 'bg-[#111827] text-white border-[#111827]'
                        : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <Layout className="w-3.5 h-3.5" /> Links
                  </button>
                  <button
                    onClick={() => setNewHeader({...newHeader, category: 'store'})}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      newHeader.category === 'store'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Store
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div className="space-y-10">
            {/* Standard Links */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#111827] flex items-center gap-2">
                  <Layout className="w-4 h-4 text-blue-600" /> Standard Links
                  {linksSearch && <span className="text-[9px] font-bold bg-[#F8FAFC] border border-[#E5E7EB] text-[#6B7280] px-2 py-0.5 rounded">{standardLinks.filter(l => l.title.toLowerCase().includes(linksSearch.toLowerCase())).length} results</span>}
                </h3>
                {/* Links Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
                  <Input
                    value={linksSearch}
                    onChange={e => setLinksSearch(e.target.value)}
                    placeholder="Search links..."
                    className="h-9 pl-9 rounded-lg bg-white border-[#E5E7EB] text-xs focus:border-blue-500 transition-all placeholder:text-[#9CA3AF]"
                  />
                </div>
              </div>
              {standardLinks.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-[#E5E7EB] rounded-2xl text-[#9CA3AF] text-sm font-medium bg-white">
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#111827] flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-blue-600" /> Digital Store Items
                  {storeSearch && <span className="text-[9px] font-bold bg-[#F8FAFC] border border-[#E5E7EB] text-[#6B7280] px-2 py-0.5 rounded">{storeLinks.filter(l => l.title.toLowerCase().includes(storeSearch.toLowerCase())).length} results</span>}
                </h3>
                {/* Store Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
                  <Input
                    value={storeSearch}
                    onChange={e => setStoreSearch(e.target.value)}
                    placeholder="Search store items..."
                    className="h-9 pl-9 rounded-lg bg-white border-[#E5E7EB] text-xs focus:border-blue-500 transition-all placeholder:text-[#9CA3AF]"
                  />
                </div>
              </div>
              {storeLinks.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-[#E5E7EB] rounded-2xl text-[#9CA3AF] text-sm font-medium bg-white">
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


      </div>
      
      {/* Analytics Modal */}
      <AnalyticsModal 
        isOpen={!!analysisLink} 
        onClose={() => setAnalysisLink(null)} 
        link={analysisLink as any} 
      />
    </div>
  );
};
