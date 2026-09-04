/**
 * Tek dosyalık derleme: tüm JS ve CSS index.html içine gömülür.
 * Kurulum gerektirmeden paylaşılabilir bir sürüm üretmek için kullanılır.
 *   npx vite build --config vite.single.config.js
 */
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
  build: {
    outDir: 'dist-single',
    target: 'es2020',
    sourcemap: false,
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    rollupOptions: { output: { inlineDynamicImports: true } }
  }
});
