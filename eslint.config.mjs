export default [
    {
        files: ["**/*.ts"],
        ignores: ["dist", "node_modules"],

        languageOptions: {
            parser: (await import("@typescript-eslint/parser")).default,
            parserOptions: {
                sourceType: "module",
                ecmaVersion: "latest"
            }
        },

        plugins: {
            "@typescript-eslint": (await import("@typescript-eslint/eslint-plugin")).default
        },

        rules: {
            // bug reali
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": ["warn"],
            "no-undef": "off",

            // sicurezza minima
            "no-eval": "error",

            // qualità
            "no-console": "off"
        }
    }
];