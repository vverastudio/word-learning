import { defineConfig } from "vite-plus";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  base: "/word-learning/",
  plugins: [
    {
      ...basicSsl(),
      apply(_, { mode }) {
        return mode === "https";
      },
    },
  ],
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
});
