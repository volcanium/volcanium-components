import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@lib": path.resolve(__dirname, "../src"),
    },
  },
  server: {
    host: true,
    port: 5180,
    strictPort: true,
  },
});
