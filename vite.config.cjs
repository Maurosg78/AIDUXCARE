import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
server: {
  port: 5175,
},
module.exports = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@modules": path.resolve(__dirname, "src/modules"),
      "@core": path.resolve(__dirname, "src/core"),
    },
  },
});
