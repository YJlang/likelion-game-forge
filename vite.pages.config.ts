import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

const repositoryBasePath = "/likelion-game-forge/";

export default defineConfig({
  base: repositoryBasePath,
  define: {
    "import.meta.env.VITE_ROUTER_HISTORY": JSON.stringify("hash"),
  },
  plugins: [react(), tailwindcss(), tsConfigPaths()],
  build: {
    outDir: "dist/pages",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@tanstack")) return "tanstack";
          if (id.includes("@radix-ui")) return "radix-ui";
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          if (id.includes("canvas-confetti")) return "effects";
          return "vendor";
        },
      },
    },
  },
});
