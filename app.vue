<template>
    <v-app>
        <v-layout>
            <v-app-bar flat border class="position-fixed">
                <v-toolbar border color="white">
                    <template #prepend>
                        <v-btn icon="mdi-menu" variant="text" class="d-md-none" @click="toggleSidebar" />
                        <v-icon class="ma-3 d-none d-md-block" icon="mdi-school" />
                    </template>
                    <v-toolbar-title class="site-title" @click="navigateTo('/')">{{ config.public.siteTitle
                        }}</v-toolbar-title>
                    <v-spacer />
                    <template #append>
                        <TopTabs />
                    </template>
                </v-toolbar>
            </v-app-bar>
            <NuxtPage />
        </v-layout>
    </v-app>
</template>

<script lang="ts" setup>
import TopTabs from '~/components/TopTabs.vue';
const config = useRuntimeConfig();

const router = useRouter();

const sidebarDrawer = ref(true);
function toggleSidebar() {
    sidebarDrawer.value = !sidebarDrawer.value;
}
function navigateTo(path: string) {
    router.push(path);
}
</script>

<style>
::-webkit-scrollbar {
    -webkit-appearance: none;
    width: 3px;
    height: 3px;
}

::-webkit-scrollbar-thumb {
    cursor: pointer;
    border-radius: 5px;
    background: rgba(0, 0, 0, 0.15);
    transition: color 0.2s ease;
}

.site-title {
    font-weight: bold;
    font-size: 1.25rem;
    cursor: pointer;
    min-width: 200px;
}
</style>