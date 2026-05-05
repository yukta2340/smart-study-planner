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
    port: 12345,
    strictPort: false,
    proxy: {
      "/api": "http://localhost:5009",
    },
  },
});
