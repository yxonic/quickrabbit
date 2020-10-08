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
      "@typescript-eslint/member-delimiter-style": ["error", {
        "multiline": {
          "delimiter": "none"
        },
        "singleline": {
            "delimiter": "semi"
        }
      }],
      "import/no-cycle": 0,
      "import/no-extraneous-dependencies": 0,
      "comma-dangle": ["error", "always-multiline"],
      "@typescript-eslint/explicit-function-return-type": 0,
      "@typescript-eslint/explicit-module-boundary-types": 0,
      "@typescript-eslint/no-explicit-any": 0,
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", {
        "vars": "all",
        "args": "after-used",
        "ignoreRestSiblings": false,
        "varsIgnorePattern": "^_",
        "argsIgnorePattern": "^_"
      }],
      "no-param-reassign": ["error", { "props": false }],
      "space-before-function-paren": 0,
      "@typescript-eslint/space-before-function-paren": ["error", "always"],
      "max-classes-per-file": 0,
      "no-console": 0,
      "lines-between-class-members": ["error", "always", { exceptAfterSingleLine: true }],
      "consistent-return": 0,
      "import/no-unresolved": 0,
      "import/prefer-default-export": 0
    }
  };
  