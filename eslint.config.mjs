// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
    rules: {
        "vue/first-attribute-linebreak": [
            "error",
            {
                singleline: "ignore",
                multiline: "ignore",
            },
        ],
        "vue/valid-v-slot": [
            "error",
            {
                allowModifiers: true,
            },
        ],
    },
});
