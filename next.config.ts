import type { NextConfig } from "next";

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "**.supabase.co";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname,
      },
      {
        protocol: "https",
        hostname: "prefeituradebelfordroxo.rj.gov.br",
      },
      {
        protocol: "https",
        hostname: "www.prefeituradebelfordroxo.rj.gov.br",
      },
    ],
  },
};

export default nextConfig;
