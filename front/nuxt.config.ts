// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@pinia/nuxt", "@nuxtjs/tailwindcss"],

  runtimeConfig: {
    public: {
      apiBase: "http://localhost:3000",
    },
  },

  app: {
    head: {
      title: "Study Buddy",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          hid: "description",
          name: "description",
          content: "Study Buddy Application",
        },
      ],
    },
  },
  plugins: ["~/plugins/auth.client.ts"],
  compatibilityDate: "2025-04-25",
});
