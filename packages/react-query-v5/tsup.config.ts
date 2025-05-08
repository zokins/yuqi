import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/v5.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ["esm", "cjs"],
  dts: true,
  outDir: "dist",
});
