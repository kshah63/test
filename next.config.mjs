// NextAuth v4 requires NEXTAUTH_URL (it auto-detects only on Vercel).
// On Render, derive it from the URL Render provides at runtime.
if (!process.env.NEXTAUTH_URL && process.env.RENDER_EXTERNAL_URL) {
  process.env.NEXTAUTH_URL = process.env.RENDER_EXTERNAL_URL;
}

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
