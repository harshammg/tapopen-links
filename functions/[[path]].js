export async function onRequest(context) {
  const { request, env, next } = context;
  const response = await next();
  
  // Only process HTML requests (the SPA fallback)
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  // Parse the URL to get the slug
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  
  // If it's a known static route, do nothing
  const knownRoutes = ["console", "auth", "products", "quick-links", "profiles", "dashboard", "login", "signup", "landing"];
  if (pathParts.length === 0 || knownRoutes.includes(pathParts[0])) {
    return response;
  }

  // The first part is likely the user slug
  const slug = pathParts[0];

  // Try to fetch profile from Supabase
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response; // Fall back to default HTML if env missing
  }

  try {
    const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?handle=eq.${slug}&select=*`, {
      headers: {
        "apikey": supabaseAnonKey,
        "Authorization": `Bearer ${supabaseAnonKey}`
      }
    });
    
    if (!profileRes.ok) return response;
    const profiles = await profileRes.json();
    if (!profiles || profiles.length === 0) return response;
    
    const profile = profiles[0];
    const profileName = profile.full_name || `@${profile.handle}`;
    const profileTitle = `${profileName} | TapOpen`;
    const profileDesc = profile.bio || `Check out ${profileName}'s links, portfolio, and blogs on TapOpen.`;
    
    // Generate an avatar placeholder if we don't have a real image uploaded
    const avatarInitials = profile.full_name 
      ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
      : (profile.handle?.[0] || "U").toUpperCase();
    const imageUrl = `https://ui-avatars.com/api/?name=${avatarInitials}&background=111827&color=fff&size=512`;

    // Rewrite the meta tags
    class MetaRewriter {
      element(element) {
        if (element.getAttribute("property") === "og:title" || element.getAttribute("name") === "twitter:title") {
          element.setAttribute("content", profileTitle);
        }
        if (element.getAttribute("property") === "og:description" || element.getAttribute("name") === "twitter:description" || element.getAttribute("name") === "description") {
          element.setAttribute("content", profileDesc);
        }
      }
    }
    
    class TitleRewriter {
      element(element) {
        element.setInnerContent(profileTitle);
      }
    }
    
    // Create new meta tag for image
    class HeadRewriter {
      element(element) {
        element.append(`<meta property="og:image" content="${imageUrl}" />\n`, { html: true });
        element.append(`<meta name="twitter:image" content="${imageUrl}" />\n`, { html: true });
      }
    }

    return new HTMLRewriter()
      .on('title', new TitleRewriter())
      .on('meta', new MetaRewriter())
      .on('head', new HeadRewriter())
      .transform(response);
      
  } catch (err) {
    // If fetching fails, return original HTML seamlessly
    return response;
  }
}
