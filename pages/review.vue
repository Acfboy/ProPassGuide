<template>
    <v-layout>
        <v-navigation-drawer permanent>
            <v-tabs v-model="tab" bg-color="transparent" color="basil" direction="vertical">
                <!-- <v-tab v-for="item in items" :key="item" :text="item" :value="item"></v-tab> -->
                <v-tab value="docs" to="/review/docs">
                    审核文档
                </v-tab>
                <v-tab value="majors" to="/review/majors">
                    审核专业
                </v-tab>
            </v-tabs>
        </v-navigation-drawer>

        <v-main fill-height class="overflow-auto-x">
            <NuxtPage />
        </v-main>
    </v-layout>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ["admin"]
})

const route = useRoute();

const match = route.path.match(/^\/review\/([^/]+)/);
const type = match ? match[1] : '';
if (!type)
    navigateTo("/review/docs");
const tab = ref<"docs" | "majors">(type == "majors" ? "majors" : "docs");


</script>