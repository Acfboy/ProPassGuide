<template>
  <div class="toolbar-search" :class="{ expanded: searchActive }" ref="searchBoxRef">
    <v-text-field
      v-model="searchKeyword"
      placeholder="搜索学院"
      prepend-inner-icon="mdi-magnify"
      clearable
      hide-details
      density="compact"
      :class="{ 'search-active': searchActive }"
      @focus="onSearchFocus"
      @blur="onSearchBlur"
      @click="onSearchFocus"
      @input="onInput"
      ref="searchInput"
    />
    <!-- 下拉搜索结果，使用fixed定位和高z-index -->
    <div v-if="searchActive && searchKeyword" class="search-dropdown-fixed" :style="dropdownStyle">
      <v-list v-if="results.length">
        <v-list-item v-for="item in results" :key="item.major_id" @mousedown.prevent="onSelect(item)" class="search-result-link">
          <v-list-item-title>{{ item.school }}</v-list-item-title>
          <v-list-item-subtitle>专业：{{ item.name }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
      <div v-else-if="!loading" class="text-center text-grey py-2">无结果</div>
      <div v-if="loading" class="d-flex justify-center py-2">
        <v-progress-circular indeterminate color="primary" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

interface MajorResult {
  major_id: string;
  name: string;
  school: string;
}

const searchActive = ref(false);
const searchKeyword = ref('');
const searchInput = ref();
const searchBoxRef = ref();
const results = ref<MajorResult[]>([]);
const loading = ref(false);
let timer: ReturnType<typeof setTimeout> | null = null;
const dropdownRect = ref({ left: 0, top: 0, width: 0 });
const router = useRouter();

const updateDropdownRect = () => {
  if (searchBoxRef.value) {
    const rect = searchBoxRef.value.getBoundingClientRect();
    dropdownRect.value = {
      left: rect.left,
      top: rect.bottom,
      width: rect.width
    };
  }
};

const dropdownStyle = computed(() => ({
  left: dropdownRect.value.left + 'px',
  top: dropdownRect.value.top + 'px',
  width: dropdownRect.value.width + 'px',
  zIndex: 2500
}));

const onSearchFocus = () => {
  searchActive.value = true;
  nextTick(() => {
    updateDropdownRect();
    if (searchInput.value && searchInput.value.focus) {
      searchInput.value.focus();
    }
  });
};
const onSearchBlur = () => {
  setTimeout(() => {
    searchActive.value = false;
  }, 150);
};
const onInput = () => {
  if (timer) clearTimeout(timer);
  if (!searchKeyword.value) {
    results.value = [];
    return;
  }
  loading.value = true;
  timer = setTimeout(async () => {
    results.value = await $fetch('/api/searchSchool', {
      method: 'POST',
      body: { keyword: searchKeyword.value }
    });
    loading.value = false;
    updateDropdownRect();
  }, 300);
};
const onSelect = (item: MajorResult) => {
  searchKeyword.value = item.school;
  searchActive.value = false;
  router.push(`/docs/${item.major_id}/${encodeURIComponent(item.name)}`);
};

// 监听窗口resize和滚动，动态更新下拉框位置
const handleWindowChange = () => updateDropdownRect();
onMounted(() => {
  window.addEventListener('resize', handleWindowChange);
  window.addEventListener('scroll', handleWindowChange, true);
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleWindowChange);
  window.removeEventListener('scroll', handleWindowChange, true);
});
</script>

<style scoped>
.toolbar-search {
  transition: width 0.3s cubic-bezier(.4,0,.2,1), box-shadow 0.3s;
  width: 160px;
  max-width: 100vw;
  margin-right: 16px;
  background: transparent;
  border-radius: 24px;
  box-shadow: none;
  display: flex;
  align-items: center;
  position: relative;
}
.toolbar-search.expanded {
  width: 340px;
  background: #fffbe7;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
}
.search-active .v-field__outline {
  border-color: #1976d2 !important;
}
.search-dropdown-fixed {
  position: fixed;
  background: #fff;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.18);
  z-index: 9999;
  max-height: 320px;
  overflow-y: auto;
}
.search-result-link {
  cursor: pointer;
  transition: color 0.15s;
}
.search-result-link:hover .v-list-item-title,
.search-result-link:hover .v-list-item-subtitle {
  color: #1976d2;
  text-decoration: underline;
}
</style> 