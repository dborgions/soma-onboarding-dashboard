import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base wordt in stap 7 op de GitHub Pages reponaam gezet; voor lokaal draaien maakt dit niets uit.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || "/",
});
