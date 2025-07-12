<template>
  <div class="top-tabs-menu d-flex align-center">
    <v-menu open-on-hover offset-y :close-on-content-click="false" attach="body" :z-index="2500">
      <template #activator="{ props }">
        <v-btn v-bind="props" variant="text">课程</v-btn>
      </template>
      <div class="menu-list-wide">
        <div class="schools-grid-2col">
          <div class="schools-col">
            <div v-for="school in leftSchools" :key="school" class="school-cell">
              <div class="school-title-row" @click="setOpenGroup('left', school)">
                <span class="school-title">{{ school }}</span>
                <v-icon v-if="openGroupLeft === school" class="ml-1">mdi-chevron-down</v-icon>
                <v-icon v-else class="ml-1">mdi-chevron-right</v-icon>
              </div>
              <transition name="fade">
                <div v-if="openGroupLeft === school" class="majors-grid">
                  <div v-for="item in groupedCourses[school]" :key="item.major_id" class="major-cell major-link" @click.stop="goToDoc(item)">
                    <span class="major-title">{{ item.name }}</span>
                  </div>
                </div>
              </transition>
            </div>
          </div>
          <div class="schools-col">
            <div v-for="school in rightSchools" :key="school" class="school-cell">
              <div class="school-title-row" @click="setOpenGroup('right', school)">
                <span class="school-title">{{ school }}</span>
                <v-icon v-if="openGroupRight === school" class="ml-1">mdi-chevron-down</v-icon>
                <v-icon v-else class="ml-1">mdi-chevron-right</v-icon>
              </div>
              <transition name="fade">
                <div v-if="openGroupRight === school" class="majors-grid">
                  <div v-for="item in groupedCourses[school]" :key="item.major_id" class="major-cell major-link" @click.stop="goToDoc(item)">
                    <span class="major-title">{{ item.name }}</span>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </v-menu>
    <v-btn variant="text" class="ml-6">快速上手</v-btn>
    <div class="top-tabs-searchbar ml-6">
      <SearchBar />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import SearchBar from '~/components/SearchBar.vue';

interface MajorItem {
  major_id: string;
  name: string;
  school: string;
}

const allCourses = ref<MajorItem[]>([]);
const openGroupLeft = ref<string | null>(null);
const openGroupRight = ref<string | null>(null);
const router = useRouter();

onMounted(async () => {
  // 获取所有school和name
  const data = await $fetch<MajorItem[]>('/api/searchSchool', {
    method: 'POST',
    body: { keyword: '' }
  });
  allCourses.value = data;
});

const groupedCourses = computed(() => {
  const map: Record<string, MajorItem[]> = {};
  for (const item of allCourses.value) {
    if (!map[item.school]) map[item.school] = [];
    map[item.school].push(item);
  }
  return map;
});

const schoolList = computed(() => Object.keys(groupedCourses.value));
const leftSchools = computed(() => schoolList.value.filter((_, i) => i % 2 === 0));
const rightSchools = computed(() => schoolList.value.filter((_, i) => i % 2 === 1));

function setOpenGroup(col: 'left' | 'right', school: string) {
  if (col === 'left') {
    openGroupLeft.value = openGroupLeft.value === school ? null : school;
  } else {
    openGroupRight.value = openGroupRight.value === school ? null : school;
  }
}

function goToDoc(item: MajorItem) {
  router.push(`/docs/${item.major_id}/${encodeURIComponent(item.name)}`);
}
</script>

<style scoped>
.top-tabs-menu {
  gap: 12px;
  display: flex;
  align-items: center;
  height: 48px;
}
.menu-list-wide {
  min-width: 50vw;
  max-width: 60vw;
  z-index: 2500 !important;
  padding-bottom: 16px;
  padding-top: 16px;
  background: #fafbfc;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}
.schools-grid-2col {
  display: flex;
  flex-direction: row;
  gap: 32px;
  padding: 0 24px;
}
.schools-col {
  flex: 1 1 0;
  min-width: 0;
}
.school-cell {
  background: #f7f7f7;
  border-radius: 6px;
  padding: 8px 12px 4px 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
  margin-bottom: 16px;
}
.school-title-row {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 1.08rem;
  cursor: pointer;
  user-select: none;
  margin-bottom: 2px;
}
.majors-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 24px;
  padding: 8px 0 4px 0;
}
.major-cell {
  padding: 2px 0;
  font-size: 1rem;
  color: #333;
}
.major-title {
  display: inline-block;
  white-space: nowrap;
}
.top-tabs-searchbar {
  min-width: 220px;
  max-width: 340px;
  display: flex;
  align-items: center;
  height: 40px;
}
.ml-6 {
  margin-left: 16px !important;
}
.fade-enter-active, .fade-leave-active {
  transition: all 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.major-link {
  cursor: pointer;
  transition: color 0.15s;
}
.major-link:hover .major-title {
  color: #1976d2;
  text-decoration: underline;
}
</style> 