import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** Mirrors previous `.eslintrc.json`: next/core-web-vitals + next/typescript (bundled in default export). */
export default require("eslint-config-next");
