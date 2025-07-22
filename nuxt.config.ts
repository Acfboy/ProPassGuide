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
            footerCopyright: "",
            footerNote: "",
            siteSubtitle: "",
        },
    },

    monacoEditor: {
        locale: "zh-hans",
        removeSourceMaps: true,
    },
    mdc: {
        remarkPlugins: {
            "remark-math": {},
        },
        rehypePlugins: {
            "rehype-mathjax": {},
        },
        highlight: { 
            theme: "github-light",
            langs: ["ts", "cpp", "markdown", "py", "rust", "c#", "js", "json", "c"],
            wrapperStyle: true
        },
    },
    vuetify: {
        vuetifyOptions: {
            locale: {
                locale: "zhHans",
            },
            localeMessages: ["zhHans"],
        },
    },
});