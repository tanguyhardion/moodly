// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/fonts", "@nuxt/icon", "@nuxt/image", "nuxt-charts"],
  ssr: false,

  app: {
    baseURL: "/moodly/",
    head: {
      title: "Moodly",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Track your daily mood, energy, sleep, and focus with beautiful visualizations",
        },
      ],
      link: [{ rel: "icon", type: "image/svg+xml", href: "logo.svg" }],
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

  css: ["~/assets/css/main.scss"],
});
