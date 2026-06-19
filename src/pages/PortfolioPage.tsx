import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  Plus, Trash2, Briefcase, GraduationCap, Code2, 
  User, Mail, MapPin, Globe, Loader2, Save,
  ChevronRight, ImageIcon, ExternalLink, Info, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  project_url: string;
  tags?: string[];
  date_range?: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  year: string;
}

const PortfolioPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile Data
  const [profile, setProfile] = useState({
    summary: "",
    contact_email: "",
    location: "",
    website: "",
    skills: [] as string[],
    education: [] as Education[],
    linkedin_url: "",
    resume_url: ""
  });

  // Items State
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProject, setNewProject] = useState<Partial<PortfolioItem>>({
    title: "", description: "", image_url: "", project_url: "", tags: [], date_range: ""
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch Profile Details
      const { data: profileData } = await supabase
        .from("profiles")
        .select("customization")
        .eq("id", session.user.id)
        .single();

      if (profileData?.customization?.portfolio) {
        const port = profileData.customization.portfolio;
        setProfile({
          summary: port.summary || "",
          contact_email: port.contact_email || "",
          location: port.location || "",
          website: port.website || "",
          skills: port.skills || [],
          education: port.education || [],
          linkedin_url: port.linkedin_url || "",
          resume_url: port.resume_url || ""
        });
      }

      // Fetch Portfolio Items
      const { data: portData } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (portData) setItems(portData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: currentProfile } = await supabase.from("profiles").select("customization").eq("id", session.user.id).maybeSingle();
      
      const newCustomization = {
        ...(currentProfile?.customization || {}),
        portfolio: profile
      };

      const { error } = await supabase
        .from("profiles")
        .update({ customization: newCustomization })
        .eq("id", session.user.id);

      if (error) throw error;
      toast.success("Professional profile updated!");
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(`Save failed: ${err?.message || JSON.stringify(err) || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !profile.skills.includes(skill)) {
      setProfile({ ...profile, skills: [...profile.skills, skill] });
    }
  };

  const addProject = async () => {
    if (!newProject.title) return toast.error("Title is required");
    setIsAddingProject(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase
        .from("portfolio_items")
        .insert([{ ...newProject, user_id: session?.user.id }])
        .select()
        .single();

      if (error) throw error;
      setItems([data, ...items]);
      setNewProject({ title: "", description: "", image_url: "", project_url: "", tags: [], date_range: "" });
      toast.success("Project added!");
    } catch (err) {
      toast.error("Failed to add project");
    } finally {
      setIsAddingProject(false);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await supabase.from("portfolio_items").delete().eq("id", id);
      setItems(items.filter(i => i.id !== id));
      toast.success("Project removed");
    } catch (err) {
      toast.error("Failed to delete project");
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex flex-col justify-center px-4 md:px-6 py-8 md:py-12 pb-32 max-w-[1000px] mx-auto w-full">
      
      {/* ---------------- CENTER FEED CONTENT (max 600px) ---------------- */}
      <div className="flex-1 w-full max-w-[600px] mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 md:mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Professional Profile</h1>
            <p className="text-sm md:text-base text-muted-foreground font-medium">Build your high-impact digital resume and portfolio.</p>
          </div>
          <div className="flex flex-col md:flex-row w-full md:w-auto gap-3 md:gap-4">
            <Button 
              variant="outline" 
              className="w-full md:w-auto h-12 px-6 rounded-2xl border-primary/20 text-primary hover:bg-primary/5 font-bold"
              onClick={async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                const { data } = await supabase.from("profiles").select("handle").eq("id", session.user.id).single();
                if (data?.handle) window.open(`/${data.handle}/portfolio`, "_blank");
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button onClick={saveProfile} disabled={saving} className="w-full md:w-auto h-12 px-8 rounded-2xl shadow-xl shadow-primary/20">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>

        {/* Stacked Content in Feed Column */}
        <div className="space-y-8">
          
          {/* Section: Professional Summary */}
          <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
              <User className="w-4 h-4" /> Professional Summary
            </h3>
            <Textarea 
              placeholder="E.g. Passionate Full Stack Developer with 5+ years experience building scalable web applications..."
              value={profile.summary}
              onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
              className="min-h-[150px] resize-none text-sm leading-relaxed"
            />
          </div>

          {/* Section: Contact & Skills */}
          <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm space-y-8">
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Contact Information
              </h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Work Email</label>
                  <Input 
                    value={profile.contact_email}
                    onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })}
                    placeholder="hello@yourwork.com"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Location</label>
                    <Input 
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      placeholder="New York, NY"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Website</label>
                    <Input 
                      value={profile.website}
                      onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                      placeholder="portfolio.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Professional Assets */}
            <div className="pt-8 border-t border-border">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
                <Save className="w-4 h-4" /> Professional Assets
              </h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">LinkedIn Profile URL</label>
                  <Input 
                    value={profile.linkedin_url}
                    onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/yourusername"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Resume / CV (Google Drive / PDF Link)</label>
                  <Input 
                    value={profile.resume_url}
                    onChange={(e) => setProfile({ ...profile, resume_url: e.target.value })}
                    placeholder="https://drive.google.com/file/d/your-resume-link"
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-border">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
                <Code2 className="w-4 h-4" /> Skills & Expertise
              </h3>
              <div className="flex gap-2 mb-4">
                <Input 
                  placeholder="e.g. TypeScript" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (addSkill(tagInput), setTagInput(""))}
                />
                <Button variant="secondary" onClick={() => (addSkill(tagInput), setTagInput(""))}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-primary/5 text-primary text-xs font-bold rounded-full border border-primary/10 flex items-center gap-2">
                    {skill}
                    <button onClick={() => setProfile({ ...profile, skills: profile.skills.filter(s => s !== skill) })} className="hover:text-destructive">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Experience & Timeline block stacked below Profile block */}
        <div className="space-y-8">
          <div className="bg-card border border-border rounded-[2rem] shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
              <h3 className="font-bold text-xl flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-primary" /> Work Experience
              </h3>
              <Button size="sm" variant="ghost" onClick={() => setIsAddingProject(true)} className="rounded-xl w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" /> Add Entry
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="p-20 text-center text-muted-foreground">
                <Briefcase className="w-12 h-12 opacity-10 mx-auto mb-4" />
                No experience entries yet.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {items.map(item => (
                  <div key={item.id} className="p-8 group hover:bg-muted/5 transition-colors">
                    <div className="flex gap-4 md:gap-6">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl border border-border bg-muted shrink-0 overflow-hidden flex items-center justify-center">
                        {item.image_url ? <img src={item.image_url} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="opacity-20" />}
                      </div>
                      <div className="flex-1 space-y-3 min-w-0">
                        <div className="flex gap-2 justify-between items-start">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-base md:text-lg font-bold group-hover:text-primary transition-colors truncate">{item.title}</h4>
                            <p className="text-xs md:text-sm font-semibold text-muted-foreground">{item.date_range || "Present"}</p>
                          </div>
                          <button onClick={() => deleteProject(item.id)} className="p-2 shrink-0 opacity-100 md:opacity-0 group-hover:opacity-100 text-destructive transition-all hover:bg-destructive/10 rounded-xl">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">{item.description}</p>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {item.tags.map(t => (
                              <span key={t} className="px-2 py-0.5 bg-muted text-[10px] font-bold rounded border border-border">{t}</span>
                            ))}
                          </div>
                        )}
                        {item.project_url && (
                          <a href={item.project_url} target="_blank" className="inline-flex items-center text-xs font-bold text-primary hover:underline pt-2">
                            View Work <ExternalLink className="ml-1 w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Education */}
          <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm mt-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Education
            </h3>
            <div className="space-y-6">
              {profile.education.map((edu, idx) => (
                <div key={edu.id} className="group relative pl-4 border-l-2 border-primary/20">
                  <button 
                    onClick={() => setProfile({ ...profile, education: profile.education.filter((_, i) => i !== idx) })}
                    className="absolute right-0 top-0 p-1 opacity-0 group-hover:opacity-100 text-destructive transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <h4 className="font-bold text-sm">{edu.degree}</h4>
                  <p className="text-xs text-muted-foreground">{edu.school}</p>
                  <p className="text-[10px] font-bold opacity-50">{edu.year}</p>
                </div>
              ))}
              <div className="pt-4 space-y-3">
                <Input placeholder="Degree / Certificate" id="new-degree" className="h-9 text-xs" />
                <Input placeholder="University / Platform" id="new-school" className="h-9 text-xs" />
                <Input placeholder="Year" id="new-year" className="h-9 text-xs" />
                <Button 
                  variant="outline" 
                  className="w-full text-[10px] font-black uppercase"
                  onClick={() => {
                    const d = (document.getElementById("new-degree") as HTMLInputElement).value;
                    const s = (document.getElementById("new-school") as HTMLInputElement).value;
                    const y = (document.getElementById("new-year") as HTMLInputElement).value;
                    if (d && s) {
                      setProfile({ ...profile, education: [...profile.education, { id: Math.random().toString(), school: s, degree: d, year: y }] });
                    }
                  }}
                >Add Education</Button>
              </div>
            </div>
          </div>

          {/* Project Adder Form (Floating) */}
          {isAddingProject && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
              <div className="bg-card border border-border rounded-[3rem] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300">
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  <Plus className="w-6 h-6 text-primary" /> New Experience
                </h3>
                <div className="space-y-4">
                  <Input placeholder="Role / Title" value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} />
                  <Input placeholder="Timeline (e.g. 2021 - Present)" value={newProject.date_range} onChange={(e) => setNewProject({...newProject, date_range: e.target.value})} />
                  <Textarea placeholder="Key achievements..." value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} className="min-h-[120px]" />
                  <Input placeholder="Company Logo URL" value={newProject.image_url} onChange={(e) => setNewProject({...newProject, image_url: e.target.value})} />
                  <div className="flex gap-4 pt-6">
                    <Button variant="ghost" onClick={() => setIsAddingProject(false)} className="flex-1 rounded-2xl h-12">Cancel</Button>
                    <Button onClick={addProject} className="flex-1 rounded-2xl h-12 font-bold">Add to Resume</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
