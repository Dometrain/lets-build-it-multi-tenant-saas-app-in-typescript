import { defineConfig } from "@playwright/test";

export default defineConfig({
  webServer: {
    command: "npm run dev", // Start Vite dev server
    port: 5173, // Ensure it matches your Vite dev server port
    reuseExistingServer: true, // Reuse the dev server if it's already running
  },
  use: {
    baseURL: "http://localhost:5173",
  },
});
