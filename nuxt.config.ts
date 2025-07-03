// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2025-05-15",
    devtools: { enabled: true },

    modules: [
        "@nuxt/eslint",
        "@nuxt/scripts",
        "@nuxt/test-utils",
        "vuetify-nuxt-module",
        "nuxt-auth-utils",
    ],

    runtimeConfig: {
        mongoDbUrl: "",
        salt: "",
        mailPassword: "",
        mailHost: "",
        mailHostname: "",
        mailUser: "",
        public: {
            requiredEmailDomain: "",
            siteTitle: "",
        },
    },
});
