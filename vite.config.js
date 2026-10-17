
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

const authContextPath = fileURLToPath(
  new URL("./src/context/authContext.jsx", import.meta.url)
);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: [
      {
        find: /^(?:\.\.\/)+context\/AuthContext(?:\.jsx)?$/,
        replacement: authContextPath,
      },
    ],
  },
});
