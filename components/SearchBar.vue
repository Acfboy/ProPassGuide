<template>
    <div v-if="majors" ref="searchBoxRef" class="toolbar-search" :class="{ expanded: searchActive }">
        <v-text-field ref="searchInput" v-model="searchKeyword" variant="plain" placeholder="搜索专业" prepend-inner-icon="mdi-magnify"
            clearable hide-details density="compact" :class="{ 'search-active': searchActive }" @focus="onSearchFocus"
            @blur="onSearchBlur" @click="onSearchFocus" @input="onInput" />
        <!-- 下拉搜索结果，使用fixed定位和高z-index -->
        <div v-if="searchActive && searchKeyword" class="search-dropdown-fixed" :style="dropdownStyle">
            <v-list v-if="results.length">
                <v-list-item v-for="item in results" :key="item.major_id" class="search-result-link"
                    @mousedown.prevent="onSelect(item)">
                    <v-list-item-title>{{ item.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ item.school }}</v-list-item-subtitle>
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

const searchActive = ref(false);
const searchKeyword = ref('');
const searchInput = ref();
const searchBoxRef = ref();
const results = ref<Major[]>([]);
const loading = ref(false);
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

const requestFetch = useRequestFetch();

/**
 * 获得各个专业列表
 */
const { data: majors } = await useAsyncData("matjors-list", () =>
    requestFetch<Major[]>("/api/majors", {
        method: "GET",
        query: {
            accepted: true
        }
    }).then((res) => {
        return res.filter((m) => m.major_id);
    })
)


const onInput = async () => {
    if (!searchKeyword.value) {
        results.value = [];
        return;
    }
    loading.value = true;
    results.value = majors.value?.filter(
        m => m.name.includes(searchKeyword.value) || m.school.includes(searchKeyword.value)
    ) ?? [];
    loading.value = false;
    updateDropdownRect();
};



const onSelect = (item: Major) => {
    searchKeyword.value = "";
    searchActive.value = false;
    router.push(`/docs/${item.major_id}`);
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
    transition: width 0.3s cubic-bezier(.4, 0, .2, 1), box-shadow 0.3s;
    width: 160px;
    margin-right: 16px;
    background: transparent;
    box-shadow: none;
}

.toolbar-search.expanded {
    width: 340px;
    background: #fffbe7;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.10);
    padding-bottom: 5px;
    padding-left: 5px;
}

.search-active .v-field__outline {
    border-color: #1976d2 !important;
}

.search-dropdown-fixed {
    position: fixed;
    background: #fff;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.18);
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
}
</style>