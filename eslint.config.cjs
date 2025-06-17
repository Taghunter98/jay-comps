const globals = require("globals");
const { defineConfig } = require("eslint/config");
const alignAssignments = require("eslint-plugin-align-assignments");

module.exports = defineConfig([
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        languageOptions: {
            parser: require("@typescript-eslint/parser"), 
            globals: globals.browser,
            ecmaVersion: "latest",
            sourceType: "module"
        },
        plugins: {
            "@typescript-eslint": require("@typescript-eslint/eslint-plugin"), 
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
