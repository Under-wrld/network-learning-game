import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // TypeScript 7 (native/Go compiler) removed the classic `typescript.js`
    // Compiler API that Next.js's built-in type-checker depends on — its
    // dependency-detection step misfires against this package's new
    // structure. `pnpm typecheck` (tsc --noEmit via the TS7 CLI, which
    // works correctly) is this repo's actual type-safety gate; see
    // DECISIONS.md.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
