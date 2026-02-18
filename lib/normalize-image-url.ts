/**
 * Convert private R2 endpoint URLs to public URLs
 */
export const normalizeImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.includes("r2.dev")) return url; // Already public

  // Convert private endpoint to public
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (publicUrl) {
    return url.replace(
      /https:\/\/[a-f0-9]+\.r2\.cloudflarestorage\.com\//,
      `${publicUrl}/`
    );
  }

  return url;
};
