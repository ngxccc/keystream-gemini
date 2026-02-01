import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default defineConfig([
  // Global Ignores
  { ignores: ["**/node_modules/", "**/dist/", "**/out/", "**/.bun/"] },

  // Base Config (Áp dụng cho tất cả)
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked, // Check cả type
  tseslint.configs.stylisticTypeChecked, // Check type để quyết định phong cách

  // TypeScript Parser Options
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Backend Configuration (Chỉ áp dụng cho folder backend)
  {
    files: ["backend/**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: { ...globals.node }, // Backend cần process, __dirname...
    },
  },

  // Frontend Configuration (Chỉ áp dụng cho folder frontend)
  {
    files: ["frontend/**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser }, // Frontend cần window, document...
    },
    plugins: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "react-hooks": reactHooks as any,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },

  // Prettier & Custom Rules
  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
    // Gộp rule của Prettier vào để tắt conflict
    rules: {
      ...eslintConfigPrettier.rules,

      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "off",

      "prettier/prettier": "warn",
    },
  },
]);
