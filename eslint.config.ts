import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default defineConfig([
  globalIgnores([
    "**/.bun/",
    "**/out/",
    "**/build/",
    "**/dist/",
    "**/node_modules/",
  ]),

  // Base Config
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked, // Check cả type
  tseslint.configs.stylisticTypeChecked, // Check type để quyết định phong cách
  eslintPluginPrettierRecommended,

  // TypeScript Parser Options
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              // modules/blog/chat.service chặn
              // modules/chat OK cần index.ts
              group: ["**/modules/*/*"],
              message:
                "Private internal access! Please import from the public interface (index.ts) of the module.",
            },
            {
              // Ngăn import ngược từ index.ts gây Circular Dependency
              group: ["./backend/src/index.ts"],
              message: "Modules should not import from App layer.",
            },
          ],
        },
      ],
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
      // eslint-disable-next-line
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
    rules: {
      ...eslintConfigPrettier.rules,

      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      "prettier/prettier": "warn",
    },
  },
]);
