import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ["react-countup"],
  },
  server: {
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // Object-form manualChunks was removed in Vite 8 (Rolldown).
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("react-leaflet") || id.includes("/leaflet/")) return "maps";
          if (id.includes("@stripe")) return "payments";
          if (id.includes("@tanstack/react-query") || id.includes("/axios/")) return "query";
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/react-router") ||
            id.includes("/scheduler/")
          )
            return "vendor";
          return undefined;
        },
      },
    },
  },
});
