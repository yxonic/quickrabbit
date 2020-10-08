module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
      project: "./tsconfig.json",
    },
    plugins: ["@typescript-eslint"],
    extends: [
      "plugin:@typescript-eslint/recommended",
      "airbnb-typescript/base"
    ],
    rules: {
      "semi": ["error", "never"],
      "@typescript-eslint/semi": ["error", "never"],
      "comma-dangle": ["error", "always-multiline"],
      "@typescript-eslint/member-delimiter-style": ["error", {
        "multiline": {
          "delimiter": "none"
        },
        "singleline": {
            "delimiter": "semi"
        }
      }],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", {
        "vars": "all",
        "args": "after-used",
        "ignoreRestSiblings": false,
        "varsIgnorePattern": "^_",
        "argsIgnorePattern": "^_"
      }],
      "lines-between-class-members": "off",
      "@typescript-eslint/lines-between-class-members": ["error", "always", { "exceptAfterSingleLine": true }],
      "class-methods-use-this": 0,
      "no-console": 0,
    }
  };
  