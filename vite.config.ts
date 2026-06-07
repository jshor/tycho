import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    publicDir: 'public',
    build: {
        outDir: 'dist',
    },
    server: {
        port: 3000,
    },
    css: {
        preprocessorOptions: {
            scss: {
                includePaths: [path.resolve(__dirname, 'src')],
            },
        },
    },
});
