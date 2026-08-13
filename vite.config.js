import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import inertia from '@inertiajs/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app/App.jsx'],
            ssr: 'resources/js/app/Ssr.jsx',
            refresh: true,
        }),
        inertia(),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./resources/js', import.meta.url)),
        },
    },
    server: {
        host: '127.0.0.1',
        hmr: {
            host: '127.0.0.1',
        },
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('canvg') || id.includes('xlsx')) {
                            return 'vendor-export';
                        }
                        if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
                            return 'vendor-charts';
                        }
                        if (id.includes('lucide-react')) {
                            return 'vendor-icons';
                        }
                        return 'vendor-core';
                    }
                }
            }
        }
    }
});
