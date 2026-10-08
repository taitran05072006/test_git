import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      "/api": {
        target: "http://192.168.64.2:8085",
        changeOrigin: true,
      },
    },
  },
});