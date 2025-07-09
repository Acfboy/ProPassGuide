// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2025-05-15",
    devtools: { enabled: false },

    modules: [
        "@nuxt/eslint",
        "@nuxt/scripts",
        "@nuxt/test-utils",
        "vuetify-nuxt-module",
        "nuxt-auth-utils",
        "nuxt-monaco-editor",
        "@nuxtjs/mdc",
    ],

    runtimeConfig: {
        mongoDbUrl: "",
        salt: "",
        mailPassword: "",
        mailHost: "",
        mailHostname: "",
        mailUser: "",
        uploadDir: "",
        public: {
            requiredEmailDomain: "",
            siteTitle: "",
        },
    },
    monacoEditor: {
        locale: "zh-hans",
        removeSourceMaps: true,
    },
});
