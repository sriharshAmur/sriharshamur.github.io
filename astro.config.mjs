import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://sriharsh.com/",
  server: { port: 3000 },
  // Fetch a page as soon as its link is hovered or touched, so the click feels instant.
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  // The CSS is small; inlining it removes a render-blocking request on first load.
  build: { inlineStylesheets: "always" },
});
