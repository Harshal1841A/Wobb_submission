import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), pitchApiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
