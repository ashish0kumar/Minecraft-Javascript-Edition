import { defineConfig } from 'vite';
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
    build: {
        sourcemap: true,
        target: 'esnext',
        esbuild: {
            target: 'esnext',
        },
    },
    plugins: [
        topLevelAwait({
            promiseExportName: "__tla",
            promiseImportName: i => `__tla_${i}`
        })
    ]
})