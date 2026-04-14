/**
 * Detection and transformation logic for native app deep-linking.
 */

export const ua = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";

export const isInInstagram = () => ua.includes("instagram");
export const isInTikTok    = () => ua.includes("bytedance") || ua.includes("tiktok");
export const isInFacebook  = () => ua.includes("fban") || ua.includes("fbav");
export const isInAppBrowser = () => isInInstagram() || isInTikTok() || isInFacebook();

export const isAndroid = () => ua.includes("android");
export const isIOS     = () => /iphone|ipad|ipod/.test(ua);

/**
 * Build a native app deep-link URI from a web URL.
 */
export const toAppScheme = (url: string): string | null => {
  try {
    const validUrl = !/^https?:\/\//i.test(url) ? 'https://' + url : url;
    const u = new URL(validUrl);
    const host = u.hostname.replace("www.", "");

    if (host.includes("youtube.com") || host.includes("youtu.be")) {
      return `youtube://www.youtube.com${u.pathname}${u.search}`;
    }
    if (host.includes("instagram.com")) {
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts.length > 0) return `instagram://user?username=${parts[0]}`;
      return `instagram://app`;
    }
    if (host.includes("spotify.com")) {
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) return `spotify://${parts[0]}/${parts[1]}`;
      return `spotify://`;
    }
    if (host.includes("twitter.com") || host.includes("x.com")) {
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts.length > 0) return `twitter://user?screen_name=${parts[0]}`;
      return `twitter://app`;
    }
    if (host.includes("tiktok.com")) {
      return `snssdk1233://user/profile${u.pathname}`;
    }
    if (host.includes("wa.me") || host.includes("whatsapp.com")) {
      const phone = u.pathname.replace(/\//g, "");
      return `whatsapp://send?phone=${phone}`;
    }
    if (host.includes("t.me") || host.includes("telegram.me")) {
      return `tg://resolve?domain=${u.pathname.replace(/\//g, "")}`;
    }
    if (host.includes("linkedin.com")) {
      return `linkedin://profile${u.pathname}`;
    }
    if (host.includes("snapchat.com")) {
      return `snapchat://add/${u.pathname.replace(/\//g, "")}`;
    }
    if (host.includes("docs.google.com")) {
      if (u.pathname.includes("/document")) return `googledocs://`;
      if (u.pathname.includes("/spreadsheets")) return `googlesheets://`;
      if (u.pathname.includes("/presentation")) return `googleslides://`;
    }
  } catch (_) {}
  return null;
};

/**
 * Android intent:// — forces Chrome to open link externally or launch the app.
 */
export const toAndroidIntent = (url: string): string => {
  try {
    const validUrl = !/^https?:\/\//i.test(url) ? 'https://' + url : url;
    const u = new URL(validUrl);
    const host = u.hostname.replace("www.", "");
    
    let pkg = null;
    if (host.includes("youtube") || host.includes("youtu.be")) pkg = "com.google.android.youtube";
    else if (host.includes("instagram")) pkg = "com.instagram.android";
    else if (host.includes("spotify")) pkg = "com.spotify.music";
    else if (host.includes("twitter") || host.includes("x.com")) pkg = "com.twitter.android";
    else if (host.includes("tiktok")) pkg = "com.zhiliaoapp.musically";
    else if (host.includes("whatsapp")) pkg = "com.whatsapp";
    else if (host.includes("telegram")) pkg = "org.telegram.messenger";
    else if (host.includes("snapchat")) pkg = "com.snapchat.android";
    else if (host.includes("linkedin")) pkg = "com.linkedin.android";
    else if (host.includes("docs.google.com")) {
      if (u.pathname.includes("/document")) pkg = "com.google.android.apps.docs.editors.docs";
      else if (u.pathname.includes("/spreadsheets")) pkg = "com.google.android.apps.docs.editors.sheets";
      else if (u.pathname.includes("/presentation")) pkg = "com.google.android.apps.docs.editors.slides";
      else if (u.pathname.includes("/forms")) pkg = "com.android.chrome";
    }
    else if (host.includes("forms.gle")) pkg = "com.android.chrome";

    if (!pkg) pkg = "com.android.chrome";

    const encodedFallback = encodeURIComponent(validUrl);
    return `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=${u.protocol.replace(":", "")};package=${pkg};S.browser_fallback_url=${encodedFallback};end`;

  } catch (_) {}
  return url;
};
