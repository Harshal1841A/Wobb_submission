import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";
import handler from "./api/pitch";

function pitchApiPlugin(): Plugin {
  return {
    name: "pitch-api-plugin",
    configureServer(server) {
      server.middlewares.use("/api/pitch", async (req, res) => {
        await handler(req, res);
      });
    },
  };
}

const env = loadEnv(process.env.NODE_ENV || "development", process.cwd(), "");
if (env.NVIDIA_API_KEY) {
  process.env.NVIDIA_API_KEY = env.NVIDIA_API_KEY;
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), pitchApiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
