import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || "https://boxbook.hu",
  integrations: [tailwind({ applyBaseStyles: false })],
  build: {
    inlineStylesheets: "auto",
  },
  // CMS-API a foglalo app-on
  vite: {
    define: {
      "import.meta.env.PUBLIC_CMS_URL": JSON.stringify(
        process.env.PUBLIC_CMS_URL || "http://localhost:3001"
      ),
    },
  },
});
