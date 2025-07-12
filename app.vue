<template>
  <v-app>
    <v-main>
      <div class="fixed-header">
        <v-toolbar border color="white">
          <template #prepend>
            <v-btn
              icon="mdi-menu"
              variant="text"
              @click="toggleSidebar"
              class="d-md-none"
            ></v-btn>
            <v-icon class="ma-3 d-none d-md-block" icon="mdi-school" />
          </template>
          <v-toolbar-title class="site-title" @click="navigateTo('/')">{{ config.public.siteTitle }}</v-toolbar-title>
          <v-spacer />
          <div class="toolbar-toptabs-wrapper">
            <TopTabs />
          </div>
        </v-toolbar>
      </div>
      <div class="main-content-with-header">
        <NuxtPage />
      </div>
      <!-- 页脚 -->
      <v-footer color="indigo-darken-4" app class="d-flex flex-column align-center justify-center py-4">
        <span class="white--text text-caption mb-1">
          {{ config.public.footerCopyright }}
        </span>
        <span class="white--text text-caption">
          {{ config.public.footerNote }}
        </span>
      </v-footer>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
// import SearchBar from '~/components/SearchBar.vue';
import TopTabs from '~/components/TopTabs.vue';
// import Sidebar from '~/components/Sidebar.vue';
const config = useRuntimeConfig();

const route = useRoute();
const router = useRouter();
const isDocsPage = computed(() => route.path.startsWith('/docs'));

// 侧边栏状态管理
const sidebarDrawer = ref(true);
function toggleSidebar() {
  sidebarDrawer.value = !sidebarDrawer.value;
}
function navigateTo(path: string) {
  router.push(path);
}
</script>

<style scoped>
.site-title {
  font-weight: bold;
  font-size: 1.25rem;
  cursor: pointer;
  min-width: 200px;
}
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1200; /* 提高层级，确保高于内容区 */
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.03);
}
.fixed-header > .v-toolbar {
  z-index: 1201; /* 再高一点，确保 toolbar 内部元素最高 */
  position: relative;
}
.fixed-header > *:not(.v-toolbar) {
  z-index: 1200;
}
.main-content-with-header {
  margin-top: 64px; /* 只需 toolbar 高度 */
  position: relative;
  z-index: 1;
}
.toolbar-toptabs-wrapper {
  display: flex;
  align-items: center;
  margin-left: 16px;
}
</style>