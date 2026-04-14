import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { platforms } from "./data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const cleanUrl = (url: string) => {
  try {
    const u = new URL(url);
    const paramsToStrip = [
      "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
      "si", "feature", "pp", // YouTube
      "igsh", "igshid", // Instagram
      "fbclid", // Facebook
      "ref", "ref_src" // Generic
    ];
    
    paramsToStrip.forEach(param => u.searchParams.delete(param));
    return u.toString().replace(/\/$/, ""); // Remove trailing slash
  } catch (e) {
    return url;
  }
};

export const getPlatform = (url: string) => {
  url = url.toLowerCase();
  if (url.includes("instagram.com")) return "Instagram";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "YouTube";
  if (url.includes("spotify.com")) return "Spotify";
  if (url.includes("twitter.com") || url.includes("x.com")) return "Twitter/X";
  if (url.includes("tiktok.com")) return "TikTok";
  if (url.includes("linkedin.com")) return "LinkedIn";
  if (url.includes("wa.me") || url.includes("whatsapp.com")) return "WhatsApp";
  if (url.includes("t.me") || url.includes("telegram.org")) return "Telegram";
  if (url.includes("snapchat.com")) return "Snapchat";
  return "Unknown";
};

