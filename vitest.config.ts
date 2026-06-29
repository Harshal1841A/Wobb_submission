/// <reference types="vitest/config" />
import path from "path";
import { defineConfig, mergeConfig } from "vite";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setup.ts"],
      exclude: ["e2e/**", "node_modules/**"],
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  })
);
