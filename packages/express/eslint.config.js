import baseConfig from "@yuqijs/eslint-config/base";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignorePatterns: ["!**/*"],
    overrides: [
      {
        files: ["*.ts", "*.tsx", "*.js", "*.jsx"],
        rules: {
          "@typescript-eslint/no-unused-vars": ["warn"],
          "@typescript-eslint/no-explicit-any": ["warn"],
        },
      },
      {
        files: ["*.ts", "*.tsx"],
        rules: {},
      },
      {
        files: ["*.js", "*.jsx"],
        rules: {},
      },
    ],
  },
  ...baseConfig,
];
