import { Instagram, Youtube, Music, Twitter, Video, Linkedin, MessageCircle, Send, Ghost } from "lucide-react";

export const platforms = [
  { name: "Instagram", icon: Instagram, color: "#E1306C" },
  { name: "YouTube", icon: Youtube, color: "#FF0000" },
  { name: "Spotify", icon: Music, color: "#1DB954" },
  { name: "Twitter/X", icon: Twitter, color: "#1DA1F2" },
  { name: "TikTok", icon: Video, color: "#00F2EA" },
  { name: "LinkedIn", icon: Linkedin, color: "#0A66C2" },
  { name: "WhatsApp", icon: MessageCircle, color: "#25D366" },
  { name: "Telegram", icon: Send, color: "#0088CC" },
  { name: "Snapchat", icon: Ghost, color: "#FFFC00" },
];

export const sampleLinks = [
  { platform: "Instagram", originalUrl: "instagram.com/harshabuilds", slug: "tapopen.app/harsha-ig", clicks: 1204, appOpenRate: 89, color: "#E1306C", icon: Instagram, created: "Mar 12, 2025" },
  { platform: "YouTube", originalUrl: "youtube.com/@harshabuilds", slug: "tapopen.app/harsha-yt", clicks: 847, appOpenRate: 82, color: "#FF0000", icon: Youtube, created: "Mar 10, 2025" },
  { platform: "Spotify", originalUrl: "open.spotify.com/artist/xyz", slug: "tapopen.app/harsha-spot", clicks: 634, appOpenRate: 91, color: "#1DB954", icon: Music, created: "Mar 8, 2025" },
  { platform: "Twitter", originalUrl: "twitter.com/harshabuilds", slug: "tapopen.app/harsha-x", clicks: 412, appOpenRate: 78, color: "#1DA1F2", icon: Twitter, created: "Mar 5, 2025" },
  { platform: "LinkedIn", originalUrl: "linkedin.com/in/harshabuilds", slug: "tapopen.app/harsha-li", clicks: 203, appOpenRate: 71, color: "#0A66C2", icon: Linkedin, created: "Mar 1, 2025" },
];

export const testimonials = [
  { quote: "Since I switched my Spotify link to TapOpen, my stream counts actually match my link clicks. The difference is wild.", name: "Rohit", handle: "@musicbyrohit", followers: "84K followers" },
  { quote: "My YouTube CTR from Instagram bio went up immediately. People are now landing in the actual app.", name: "Priya", handle: "@fitnesswithpriya", followers: "210K followers" },
  { quote: "Took 30 seconds to set up. Now every link in my bio opens the right app every single time.", name: "Sandeep", handle: "@techtalksandeep", followers: "52K followers" },
];

export const chartData = Array.from({ length: 14 }, (_, i) => {
  const date = new Date(2025, 2, i + 1);
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    appOpens: Math.floor(180 + Math.random() * 100),
    browserFallbacks: Math.floor(30 + Math.random() * 40),
  };
});
