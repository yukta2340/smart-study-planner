import { defineConfig, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    {
      name: "treat-js-files-as-jsx",
      enforce: "pre",
      async transform(code, id) {
        if (!/src\/.*\.js$/.test(id)) {
          return null;
        }

        return transformWithEsbuild(code, id, {
          loader: "jsx",
          jsx: "automatic",
        });
      },
    },
    react({
      include: /\.[jt]sx?$/,
    }),
  ],
  optimizeDeps: {
    entries: ["index.html"],
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  server: {
    proxy: {
      "/login": "http://localhost:5000",
      "/register": "http://localhost:5000",
      "/send-otp": "http://localhost:5000",
      "/verify-otp": "http://localhost:5000",
      "/tasks": "http://localhost:5000",
      "/add-task": "http://localhost:5000",
      "/update-task": "http://localhost:5000",
      "/delete-task": "http://localhost:5000",
      "/task-assistant": "http://localhost:5000",
      "/upload-task-image": "http://localhost:5000",
      "/chat-assistant": "http://localhost:5000",
      "/ai-suggestions": "http://localhost:5000",
      "/notify-task-push": "http://localhost:5000",
      "/register-device-token": "http://localhost:5000",
      "/generate-plan": "http://localhost:5000",
    },
  },
});
