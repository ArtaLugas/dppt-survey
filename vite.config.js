import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    server: {
        host: "localhost",
        watch: {
            usePolling: true,
            interval: 100,
        },
        hmr: {
            host: "localhost",
        },
    },
    plugins: [
        laravel({
            input: "resources/js/app.jsx",
            refresh: [
                "resources/js/**",
                "routes/**",
                "app/Http/**",
                "app/Models/**",
            ],
        }),
        react(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "resources/js"),
        },
    },
});
