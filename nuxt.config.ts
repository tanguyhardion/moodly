// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/fonts", "@nuxt/icon", "@nuxt/image", "nuxt-charts", "@vite-pwa/nuxt"],
  ssr: false,

  // Backend URL for the API client; `$development` points it at `vercel dev` locally.
  runtimeConfig: {
    public: {
      apiBase: "https://moodly-backend.vercel.app",
    },
  },

  $development: {
    runtimeConfig: {
      public: {
        apiBase: "http://localhost:3001",
      },
    },
  },

  app: {
    baseURL: "/moodly/",
    head: {
      title: "Moodly",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "theme-color", content: "#f2a93b" },
        {
          name: "description",
          content:
            "Track your daily mood, energy, sleep, and focus with beautiful visualizations",
        },
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "logo.svg" },
        { rel: "apple-touch-icon", href: "apple-touch-icon.png" },
      ],
    },
  },

  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],

  nitro: {
    prerender: {
      routes: ["/"],
    },
  },

  // Installable app: opens full-screen from the home screen, and the app shell is cached
  // so it loads offline (unsaved check-ins are already kept as local drafts).
  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "Moodly",
      short_name: "Moodly",
      description: "Track your daily mood, energy, sleep, and focus",
      theme_color: "#f2a93b",
      background_color: "#fdf3e4",
      display: "standalone",
      icons: [
        { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
      ],
    },
    workbox: {
      navigateFallback: "/moodly/",
      globPatterns: ["**/*.{js,css,html,png,svg,ico,woff2}"],
    },
  },

  css: ["~/assets/css/main.css"],

  vite: {
    plugins: [tailwindcss()],
  },
});
