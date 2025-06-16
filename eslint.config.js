import globals from "globals";
import { defineConfig } from "eslint/config";
import alignAssignments from "eslint-plugin-align-assignments";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default defineConfig([
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        languageOptions: {
            parser: tsParser,
            globals: globals.browser,
            ecmaVersion: "latest",
            sourceType: "module"
        },
        plugins: {
            "@typescript-eslint": tseslint,
            "align-assignments": alignAssignments
        },
        rules: {
            "@typescript-eslint/no-unused-vars": "warn",
            "align-assignments/align-assignments": "error",
            "indent": ["error", 4],
            "semi": ["error", "always"],
            "padded-blocks": ["error", "always"],
            "no-inline-comments": ["error", { "ignorePattern": "(html|css|style)" }],
            "camelcase": "error"
        }
    },
]);