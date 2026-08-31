/**
 * Image domain validation helper for SafarNama Content Security Policy (CSP) compliance.
 */

export const TRUSTED_IMAGE_PROVIDERS = [
  "Unsplash (images.unsplash.com)",
  "Wikimedia (upload.wikimedia.org)",
  "Pexels (images.pexels.com)",
  "Imgur (i.imgur.com)",
  "Cloudinary (res.cloudinary.com)",
  "GitHub (avatars.githubusercontent.com)",
  "Google (lh3.googleusercontent.com)",
  "Convex Storage (*.convex.cloud, *.convex.site)",
];

export const TRUSTED_IMAGE_HELPER_TEXT =
  "Photo URLs must be hosted on trusted image platforms (Unsplash, Wikimedia, Pexels, Imgur, Cloudinary, GitHub, Google, or Convex).";

const TRUSTED_DOMAIN_SUFFIXES = [
  "unsplash.com",
  "wikimedia.org",
  "pexels.com",
  "imgur.com",
  "cloudinary.com",
  "githubusercontent.com",
  "googleusercontent.com",
  "convex.cloud",
  "convex.site",
  "gstatic.com",
  "google.com",
  "googleapis.com",
  "openstreetmap.org",
];

/**
 * Validates if a string is a valid photo URL hosted on an allowlisted domain
 * or a data URI.
 */
export function isTrustedImageUrl(urlStr: string): boolean {
  if (!urlStr) return false;
  const trimmed = urlStr.trim();
  if (!trimmed) return false;

  // Allow data URIs and blob URIs
  if (/^data:image\/.+/i.test(trimmed) || /^blob:.+/i.test(trimmed)) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const host = parsed.hostname.toLowerCase();

    // Check if hostname matches or ends with any trusted domain suffix
    return TRUSTED_DOMAIN_SUFFIXES.some(
      (domain) => host === domain || host.endsWith("." + domain)
    );
  } catch (e) {
    return false;
  }
}
