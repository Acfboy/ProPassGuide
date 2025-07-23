<template>
    <v-app>
        <v-layout>
            <v-app-bar flat border class="position-fixed" :density="mobile ? 'compact' : 'comfortable'">
                <v-toolbar border color="white" :density="mobile ? 'compact' : 'comfortable'">
                    <template #prepend>
                        <v-btn v-if="$vuetify.display.mobile && sidebarLabel" icon="mdi-menu" variant="text" @click="toggleSidebar" />
                        <v-icon v-else class="ma-3" icon="mdi-school" />
                    </template>
                    <v-toolbar-title :class="$vuetify.display.mobile ? 'text-body-1' : ''" @click="navigateTo('/')">{{ config.public.siteTitle
                        }}</v-toolbar-title>
                    <v-spacer class="d-none d-md-block" />
                    <template #append>
                        <TopTabs />
                    </template>
                </v-toolbar>
            </v-app-bar>
            <NuxtPage :sidebar="sidebarDrawer" />
        </v-layout>
    </v-app>
</template>

<script lang="ts" setup>
import TopTabs from '~/components/TopTabs.vue';
const config = useRuntimeConfig();

const router = useRouter();
const route = useRoute();
const mobile = useNuxtApp().$vuetify.display.smAndDown;

const sidebarLabel = computed(() => {
    const path = route.path.includes("edit");
    return path || route.params.major;
})

const sidebarDrawer = ref(false);
function toggleSidebar() {
    sidebarDrawer.value = !sidebarDrawer.value;
}

watch(() => route.path, () => {
    if (mobile)
        sidebarDrawer.value = false;
})

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