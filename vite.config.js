/* global process */
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiPort = env.PORT || "4000";
  const proxy = {
    "/api": `http://localhost:${apiPort}`,
  };

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy,
    },
    preview: {
      proxy,
    },
  };
});
