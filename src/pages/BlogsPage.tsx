import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, FileText, Loader2, BookOpen, Clock, Calendar, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  created_at: string;
}

const BlogsPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newPost, setNewPost] = useState<Partial<BlogPost>>({
    title: "",
    excerpt: "",
    content: "",
    image_url: ""
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  const addPost = async () => {
    if (!newPost.title || !newPost.content) {
      toast.error("Please enter a title and content");
      return;
    }

    setIsAdding(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("blog_posts")
        .insert([{ ...newPost, user_id: session.user.id }])
        .select()
        .single();

      if (error) throw error;
      setPosts([data, ...posts]);
      setNewPost({ title: "", excerpt: "", content: "", image_url: "" });
      toast.success("Article published successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to publish article");
    } finally {
      setIsAdding(false);
    }
  };

  const deletePost = async (id: string) => {
    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
      setPosts(posts.filter(post => post.id !== id));
      toast.success("Article deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete article");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="flex flex-col justify-center px-4 md:px-6 py-8 md:py-12 pb-32 max-w-[1000px] mx-auto w-full">
        
        {/* ---------------- CENTER FEED CONTENT (max 650px) ---------------- */}
        <div className="flex-1 w-full max-w-[650px] mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-12">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight mb-2">Blogs</h1>
              <p className="text-sm text-[#6B7280] font-medium">Write and share your stories with the world.</p>
            </div>

          </div>

          {/* Stacked Content in Feed Column */}
          <div className="space-y-8">
            
            {/* Editor Form */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 md:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-[#111827] mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Write New Article
              </h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] ml-1">Title</label>
                  <Input 
                    placeholder="e.g. 10 Tips for Modern Web Design" 
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    className="h-11 rounded-xl bg-white border-[#E5E7EB] text-sm text-[#111827] focus:border-blue-500 placeholder:text-[#9CA3AF]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] ml-1">Excerpt (Short Summary)</label>
                  <Input 
                    placeholder="A quick summary for the preview..." 
                    value={newPost.excerpt}
                    onChange={(e) => setNewPost({...newPost, excerpt: e.target.value})}
                    className="h-11 rounded-xl bg-white border-[#E5E7EB] text-sm text-[#111827] focus:border-blue-500 placeholder:text-[#9CA3AF]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] ml-1">Cover Image URL</label>
                  <Input 
                    placeholder="https://..." 
                    value={newPost.image_url}
                    onChange={(e) => setNewPost({...newPost, image_url: e.target.value})}
                    className="h-11 rounded-xl bg-white border-[#E5E7EB] text-sm text-[#111827] focus:border-blue-500 placeholder:text-[#9CA3AF]"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Content</label>
                    <span className="text-[9px] text-[#9CA3AF] font-medium">Markdown Supported</span>
                  </div>
                  <Textarea 
                    placeholder="Write your story here... You can use Markdown to add links like this: [Click Here](https://example.com)" 
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    className="min-h-[250px] resize-y rounded-xl bg-white border-[#E5E7EB] text-sm text-[#111827] focus:border-blue-500 placeholder:text-[#9CA3AF] p-4"
                  />
                  <p className="text-[10px] text-[#6B7280] ml-1 mt-1">
                    💡 Tip: To add a link, type <code className="bg-[#F8FAFC] border border-[#E5E7EB] px-1.5 py-0.5 rounded text-[#111827] font-mono">[Your Text](https://your-url.com)</code>
                  </p>
                </div>
                <Button 
                  onClick={addPost} 
                  disabled={isAdding}
                  className="w-full rounded-xl h-11 font-bold shadow-none mt-4 bg-[#111827] hover:bg-black text-white"
                >
                  {isAdding ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <BookOpen className="w-4 h-4 mr-1.5" />}
                  Publish Article
                </Button>
              </div>
            </div>

            {/* Blogs List */}
            <div>
              {posts.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-[#E5E7EB] rounded-2xl p-16 text-center">
                <div className="w-12 h-12 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-5 h-5 text-[#9CA3AF]" />
                </div>
                <h3 className="text-sm font-bold text-[#111827] mb-1">No articles yet</h3>
                <p className="text-xs text-[#6B7280] max-w-xs mx-auto font-medium">Your stories will appear here once you publish your first article.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="group bg-white border border-[#E5E7EB] rounded-2xl p-5 md:p-6 flex flex-col md:flex-row gap-5 hover:border-blue-200 hover:shadow-sm transition-all">
                    {post.image_url && (
                      <div className="w-full md:w-40 h-40 rounded-xl overflow-hidden shrink-0 border border-[#E5E7EB]">
                        <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col min-w-0">
                      <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(post.created_at), "MMM d, yyyy")}</span>
                        <span className="w-1 h-1 bg-[#D1D5DB] rounded-full" />
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 3 min read</span>
                      </div>
                      <h4 className="font-bold text-[#111827] text-lg mb-1.5 group-hover:text-blue-600 transition-colors truncate">{post.title}</h4>
                      <p className="text-sm text-[#4B5563] line-clamp-2 mb-4 flex-1 leading-relaxed">{post.excerpt || post.content.substring(0, 150) + "..."}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <Button variant="ghost" className="p-0 h-auto font-bold text-[11px] uppercase tracking-widest text-blue-600 hover:text-blue-700 hover:bg-transparent">Read Full Story</Button>
                        <button 
                          onClick={() => deletePost(post.id)}
                          className="p-1.5 text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default BlogsPage;
