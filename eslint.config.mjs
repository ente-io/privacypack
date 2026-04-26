import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    {
        ignores: [
            ".next/**",
            ".open-next/**",
            ".wrangler/**",
            "node_modules/**",
            "cloudflare-env.d.ts",
            "next-env.d.ts",
            "playwright-report/**",
            "test-results/**",
            "tsconfig.tsbuildinfo",
        ],
    },
    ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
