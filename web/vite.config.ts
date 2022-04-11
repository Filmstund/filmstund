import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import svgrPlugin from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgrPlugin()],
  build: {
    outDir: "build",
    sourcemap: true,
  },
  server: {
    host: "local.filmstund.se",
    port: 8080,
    cors: {
      origin: /local\.filmstund\.se/,
      credentials: true,
    },
    proxy: {
      "/api": "http://localhost:8079",
      "/login": "http://localhost:8079",
      "/logout": "http://localhost:8079",
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
});
