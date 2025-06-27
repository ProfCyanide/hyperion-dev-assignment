import vercelRemix from "@vercel/remix";

/** @type {import('@remix-run/dev').AppConfig} */
export default {
  serverBuildTarget: "vercel",
  ignoredRouteFiles: ["**/.*"],
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true,
    v3_singleFetch: true,
    v3_lazyRouteDiscovery: true,
  },
  vitePlugin: vercelRemix.vite(),
};