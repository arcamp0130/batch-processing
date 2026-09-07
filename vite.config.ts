import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
    root: "./src",
    server: {
        port: 3030
    },
    build: {
        outDir: './dist',
        sourcemap: true,
    },
    resolve: {
        alias: {
            "@sass": path.resolve(import.meta.dirname, './src/scripts/sass'),
            "@managers/index": path.resolve(import.meta.dirname, './src/scripts/managers/managers.index.ts'),
            "@structures/index": path.resolve(import.meta.dirname, './src/scripts/structures/structures.index.ts'),
            "@workers/index": path.resolve(import.meta.dirname, './src/scripts/workers/workers.index.ts'),
            "@types": path.resolve(import.meta.dirname, './src/scripts/types')
        }
    }
});
