import { defineConfig } from "vite";

export default defineConfig({
    root: "./src",
    server: {
        port: 3030
    },
    build: {
        outDir: './dist',
        sourcemap: true,
    }
});
