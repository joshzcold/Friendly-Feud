// @ts-check

import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  [eslint.configs.recommended, tseslint.configs.recommended],
  globalIgnores(["node_modules", ".next", "public", ".husky", "scripts", "tailwind.config.js"])
);
