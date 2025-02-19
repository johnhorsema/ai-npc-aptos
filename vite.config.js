import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
import copy from "rollup-plugin-copy";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
    copy({
      targets: [
        {
          src: "dist/assets/*.css",
          dest: "dist/assets/",
          rename: "shared.css",
        },
      ],
      hook: "writeBundle",
    }),
    VitePWA({
      includeAssets: [
        "/assets/favicon.ico",
        "/assets/apple-touch-icon-180x180.png",
        "/assets/maskable-icon-512x512.png",
      ],
      manifest: {
        name: "Dusty AI",
        short_name: "DustyAI",
        description: "A speck of dust in your heart.",
        theme_color: "#897a78",
        icons: [
          {
            src: "/assets/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/assets/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [
          /^\/assets\/dusty\/clip/,
          /^\/assets\/documents/,
          /^\/shared/,
          /^\/admin/,
          /^\/moderator/,
          /^\/editor/,
          /^\/lab/,
          /^\/activate/,
          /^\/terms/,
          /^\/privacy/,
          /^\/ust_trial/,
          /^\/chat/,
          /^\/diary/,
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["vue", "vue-router"],
        },
      },
    },
  },
});
