const { defineConfig } = require("vite");
const react = require("@vitejs/plugin-react");
const path = require("path");
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
