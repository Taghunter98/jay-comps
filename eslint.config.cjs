/**
 * Copyright (c) 2025 Josh Bassett, whondo.com
 * 
 * Filename:    eslint.conf.cjs.js
 * Author:      Josh Bassett
 * Date:        11/06/2025
 * Version:     1.0
 * 
 * Description: ESLint config file for code quality enforcement.
 */

const globals = require("globals");
const { defineConfig } = require("eslint/config");
const alignAssignments = require("eslint-plugin-align-assignments");

/**
 * The config enforces:
 * 
 *  - Aligns assignments
 *  - Four space indentation
 *  - Semi colons
 *  - Padding inside functions
 *  - No inline comments
 *  - Camel case variables
 *      
 */
module.exports = defineConfig([
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        languageOptions: {
            globals: globals.browser,
            ecmaVersion: "latest",
            sourceType: "module"
        },
        plugins: {
            "align-assignments": alignAssignments
        },
        rules: {
            "align-assignments/align-assignments": "error",
            "indent": ["error", 4],
            "semi": ["error", "always"],
            "padded-blocks": ["error", "always"],
            "no-inline-comments": ["error", { "ignorePattern": "(html|css|style)" }],
            "camelcase": "error"
        }
    },
]);