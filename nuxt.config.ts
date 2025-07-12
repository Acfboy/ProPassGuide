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

    mdc: {
        // @ts-expect-error extendMarkdownIt is supported at runtime
        extendMarkdownIt(md) {
            // 禁用 anchor 插件，防止标题变成超链接
            md.core.ruler.disable('anchor');
        }
    },

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
            footerNote: ""
        },
    },
    monacoEditor: {
        locale: "zh-hans",
        removeSourceMaps: true,
    },
});
