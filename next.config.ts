import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The embedded Sanity Studio (src/app/studio) pulls in client-only,
  // hook-based code that isn't designed to be bundled into the Server
  // Components graph. Marking it external keeps Next from trying to
  // resolve it under the "react-server" export condition.
  serverExternalPackages: ["sanity", "@sanity/vision", "@sanity/ui"],
};

export default nextConfig;
