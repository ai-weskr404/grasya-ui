import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: resolve(__dirname, "electron/main.cjs"),
      },
    },
  },
  preload: {
    build: {
      rollupOptions: {
        input: resolve(__dirname, "electron/preload.cjs"),
      },
    },
  },
  renderer: {
    plugins: [react()],
  },
});
