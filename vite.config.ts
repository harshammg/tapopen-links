import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";



import { cloudflare } from "@cloudflare/vite-plugin";



// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "127.0.0.1",
    port: 5173,
    hmr: {
      overlay: false,
    },
  },
  envPrefix: ['VITE_', 'SUPABASE_'],
  plugins: [react(), cloudflare()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react', 'framer-motion'],
          charts: ['recharts'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
}));