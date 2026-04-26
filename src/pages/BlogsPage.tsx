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
    <div className="max-w-6xl mx-auto px-6 py-12 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Blogs</h1>
          <p className="text-muted-foreground">Write and share your stories with the world.</p>
        </div>
        <Button 
          variant="outline" 
          className="h-12 px-6 rounded-2xl border-primary/20 text-primary hover:bg-primary/5 font-bold self-start md:self-center"
          onClick={async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const { data } = await supabase.from("profiles").select("handle").eq("id", session.user.id).single();
            if (data?.handle) window.open(`/${data.handle}/blogs`, "_blank");
          }}
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview Blog
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Editor Form */}
        <div className="lg:col-span-5">
          <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> Write New Article
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Title</label>
                <Input 
                  placeholder="e.g. 10 Tips for Modern Web Design" 
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  className="rounded-xl h-12"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Excerpt (Short Summary)</label>
                <Input 
                  placeholder="A quick summary for the preview..." 
                  value={newPost.excerpt}
                  onChange={(e) => setNewPost({...newPost, excerpt: e.target.value})}
                  className="rounded-xl h-12"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Cover Image URL</label>
                <Input 
                  placeholder="https://..." 
                  value={newPost.image_url}
                  onChange={(e) => setNewPost({...newPost, image_url: e.target.value})}
                  className="rounded-xl h-12"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Content</label>
                  <span className="text-[9px] text-muted-foreground/70 font-medium">Markdown Supported</span>
                </div>
                <Textarea 
                  placeholder="Write your story here... You can use Markdown to add links like this: [Click Here](https://example.com)" 
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  className="rounded-xl min-h-[250px] resize-y"
                />
                <p className="text-[10px] text-muted-foreground ml-1 mt-1">
                  💡 Tip: To add a link, type <code className="bg-muted px-1 py-0.5 rounded text-primary">[Your Text](https://your-url.com)</code>
                </p>
              </div>
              <Button 
                onClick={addPost} 
                disabled={isAdding}
                className="w-full rounded-xl h-12 font-bold shadow-lg mt-4"
              >
                {isAdding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BookOpen className="w-4 h-4 mr-2" />}
                Publish Article
              </Button>
            </div>
          </div>
        </div>

        {/* Blogs List */}
        <div className="lg:col-span-7">
          {posts.length === 0 ? (
            <div className="bg-muted/30 border-2 border-dashed border-border rounded-[2rem] p-20 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold mb-2">No articles yet</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">Your stories will appear here once you publish your first article.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="group bg-card border border-border rounded-[2rem] p-6 flex flex-col md:flex-row gap-6 hover:border-primary/30 hover:shadow-xl transition-all animate-in slide-in-from-right-4 duration-500">
                  {post.image_url && (
                    <div className="w-full md:w-40 h-40 rounded-2xl overflow-hidden shrink-0">
                      <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(post.created_at), "MMM d, yyyy")}</span>
                      <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 3 min read</span>
                    </div>
                    <h4 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">{post.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{post.excerpt || post.content.substring(0, 150) + "..."}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <Button variant="ghost" className="p-0 h-auto font-bold text-xs uppercase tracking-widest text-primary hover:bg-transparent">Read Full Story</Button>
                      <button 
                        onClick={() => deletePost(post.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
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
  );
};

export default BlogsPage;
