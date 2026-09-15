import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serveert dit project op https://dborgions.github.io/soma-onboarding-dashboard/
// Lokaal draaien (npm run dev) blijft gewoon op http://localhost:5173/.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/soma-onboarding-dashboard/" : "/",
}));
