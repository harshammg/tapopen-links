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

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (isInitialLoad) {
      if (!loading && profile.summary !== undefined) {
        setIsInitialLoad(false);
      }
      return;
    }
    
    const timer = setTimeout(() => {
      saveProfile();
    }, 1500);
    return () => clearTimeout(timer);
  }, [profile]);

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
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="flex flex-col justify-center px-4 md:px-6 py-8 md:py-12 pb-32 max-w-[1000px] mx-auto w-full">
        
        {/* ---------------- CENTER FEED CONTENT (max 650px) ---------------- */}
        <div className="flex-1 w-full max-w-[650px] mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 md:mb-12">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight mb-2">Professional Profile</h1>
              <p className="text-sm text-[#6B7280] font-medium">Build your high-impact digital resume and portfolio.</p>
            </div>

          </div>

          {/* Stacked Content in Feed Column */}
          <div className="space-y-6">
            {/* Section: Professional Summary */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-4 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-blue-600" /> Professional Summary
              </h3>
              <Textarea 
                placeholder="E.g. Passionate Full Stack Developer with 5+ years experience building scalable web applications..."
                value={profile.summary}
                onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                className="min-h-[120px] resize-none text-sm leading-relaxed rounded-xl border-[#E5E7EB] focus:border-blue-500 placeholder:text-[#9CA3AF] p-4"
              />
            </div>

            {/* Section: Contact & Skills */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-8">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-4 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-600" /> Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-[#6B7280]">Work Email</label>
                    <Input 
                      value={profile.contact_email}
                      onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })}
                      placeholder="hello@yourwork.com"
                      className="h-11 rounded-xl bg-white border-[#E5E7EB] text-sm text-[#111827] focus:border-blue-500 placeholder:text-[#9CA3AF]"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-[#6B7280]">Location</label>
                      <Input 
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        placeholder="New York, NY"
                        className="h-11 rounded-xl bg-white border-[#E5E7EB] text-sm text-[#111827] focus:border-blue-500 placeholder:text-[#9CA3AF]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-[#6B7280]">Website</label>
                      <Input 
                        value={profile.website}
                        onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                        placeholder="portfolio.com"
                        className="h-11 rounded-xl bg-white border-[#E5E7EB] text-sm text-[#111827] focus:border-blue-500 placeholder:text-[#9CA3AF]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            <div className="pt-8 border-t border-[#E5E7EB]">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-4 flex items-center gap-2">
                <Save className="w-3.5 h-3.5 text-blue-600" /> Professional Assets
              </h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-[#6B7280]">LinkedIn Profile URL</label>
                  <Input 
                    value={profile.linkedin_url}
                    onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/yourusername"
                    className="h-11 rounded-xl bg-white border-[#E5E7EB] text-sm text-[#111827] focus:border-blue-500 placeholder:text-[#9CA3AF]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-[#6B7280]">Resume / CV (Google Drive / PDF Link)</label>
                  <Input 
                    value={profile.resume_url}
                    onChange={(e) => setProfile({ ...profile, resume_url: e.target.value })}
                    placeholder="https://drive.google.com/file/d/your-resume-link"
                    className="h-11 rounded-xl bg-white border-[#E5E7EB] text-sm text-[#111827] focus:border-blue-500 placeholder:text-[#9CA3AF]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-[#E5E7EB]">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-4 flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-blue-600" /> Skills & Expertise
              </h3>
              <div className="flex gap-2 mb-4">
                <Input 
                  placeholder="e.g. TypeScript" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (addSkill(tagInput), setTagInput(""))}
                  className="h-11 rounded-xl bg-white border-[#E5E7EB] text-sm text-[#111827] focus:border-blue-500 placeholder:text-[#9CA3AF]"
                />
                <Button variant="outline" onClick={() => (addSkill(tagInput), setTagInput(""))} className="h-11 px-5 rounded-xl border-[#E5E7EB] text-[#111827] hover:bg-[#F8FAFC]">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-[#F8FAFC] text-[#111827] text-xs font-bold rounded-lg border border-[#E5E7EB] flex items-center gap-2">
                    {skill}
                    <button onClick={() => setProfile({ ...profile, skills: profile.skills.filter(s => s !== skill) })} className="text-[#9CA3AF] hover:text-red-600">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Experience & Timeline block stacked below Profile block */}
        {/* Experience & Timeline block stacked below Profile block */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#E5E7EB] bg-[#F8FAFC] flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
              <h3 className="font-bold text-[#111827] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" /> Work Experience
              </h3>
              <Button size="sm" variant="outline" onClick={() => setIsAddingProject(true)} className="rounded-xl h-9 px-4 border-[#E5E7EB] hover:bg-[#E5E7EB]/50 text-[#111827] shadow-none w-full sm:w-auto">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Entry
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="p-16 text-center text-[#9CA3AF] text-sm font-medium">
                <Briefcase className="w-8 h-8 opacity-20 mx-auto mb-3" />
                No experience entries yet.
              </div>
            ) : (
              <div className="divide-y divide-[#E5E7EB]">
                {items.map(item => (
                  <div key={item.id} className="p-6 group hover:bg-[#F8FAFC] transition-colors">
                    <div className="flex gap-4 md:gap-5">
                      <div className="w-12 h-12 rounded-xl border border-[#E5E7EB] bg-white shrink-0 overflow-hidden flex items-center justify-center">
                        {item.image_url ? <img src={item.image_url} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-[#E5E7EB]" />}
                      </div>
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex gap-2 justify-between items-start">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-[#111827] group-hover:text-blue-600 transition-colors truncate">{item.title}</h4>
                            <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide">{item.date_range || "Present"}</p>
                          </div>
                          <button onClick={() => deleteProject(item.id)} className="p-1.5 shrink-0 opacity-100 md:opacity-0 group-hover:opacity-100 text-[#9CA3AF] transition-all hover:bg-red-50 hover:text-red-600 rounded-lg">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-sm leading-relaxed text-[#4B5563] whitespace-pre-line">{item.description}</p>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {item.tags.map(t => (
                              <span key={t} className="px-2 py-0.5 bg-white text-[10px] font-bold text-[#6B7280] rounded border border-[#E5E7EB]">{t}</span>
                            ))}
                          </div>
                        )}
                        {item.project_url && (
                          <a href={item.project_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs font-bold text-blue-600 hover:underline pt-2">
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
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-4 flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" /> Education
            </h3>
            <div className="space-y-6">
              {profile.education.map((edu, idx) => (
                <div key={edu.id} className="group relative pl-4 border-l-2 border-[#E5E7EB] hover:border-blue-600 transition-colors">
                  <button 
                    onClick={() => setProfile({ ...profile, education: profile.education.filter((_, i) => i !== idx) })}
                    className="absolute right-0 top-0 p-1 opacity-0 group-hover:opacity-100 text-[#9CA3AF] hover:text-red-600 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <h4 className="font-bold text-sm text-[#111827]">{edu.degree}</h4>
                  <p className="text-xs text-[#6B7280] font-medium">{edu.school}</p>
                  <p className="text-[10px] font-bold text-[#9CA3AF]">{edu.year}</p>
                </div>
              ))}
              <div className="pt-4 space-y-3">
                <Input placeholder="Degree / Certificate" id="new-degree" className="h-10 text-xs rounded-lg border-[#E5E7EB]" />
                <Input placeholder="University / Platform" id="new-school" className="h-10 text-xs rounded-lg border-[#E5E7EB]" />
                <Input placeholder="Year" id="new-year" className="h-10 text-xs rounded-lg border-[#E5E7EB]" />
                <Button 
                  variant="outline" 
                  className="w-full text-xs font-bold rounded-lg h-10 border-[#E5E7EB] text-[#111827] hover:bg-[#F8FAFC]"
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
            <div className="fixed inset-0 bg-[#111827]/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
              <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
                <h3 className="text-lg font-bold text-[#111827] mb-6 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" /> New Experience
                </h3>
                <div className="space-y-4">
                  <Input placeholder="Role / Title" value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} className="h-11 rounded-xl border-[#E5E7EB]" />
                  <Input placeholder="Timeline (e.g. 2021 - Present)" value={newProject.date_range} onChange={(e) => setNewProject({...newProject, date_range: e.target.value})} className="h-11 rounded-xl border-[#E5E7EB]" />
                  <Textarea placeholder="Key achievements..." value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} className="min-h-[120px] rounded-xl border-[#E5E7EB] resize-none" />
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setIsAddingProject(false)} className="flex-1 rounded-xl h-11 border-[#E5E7EB] text-[#111827]">Cancel</Button>
                    <Button onClick={addProject} className="flex-1 rounded-xl h-11 font-bold bg-[#111827] text-white hover:bg-black">Add to Resume</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
