<template>
  <v-navigation-drawer
    class="sidebar"
    width="320"
  >
    <div class="sidebar-header">
      <v-btn
        icon
        variant="text"
        class="sidebar-toggle-btn"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </div>
    <v-divider></v-divider>
    <v-list density="compact" nav>
      <v-list-item
        prepend-icon="mdi-home"
        title="首页"
        value="home"
        @click="navigateTo('/')"
      ></v-list-item>
    </v-list>
    <v-divider></v-divider>
    <div class="sidebar-content">
      <v-list density="compact" nav>
        <!-- 一级：当前专业 -->
        <v-list-item
          v-if="currentMajor"
          class="major-item"
          :title="currentMajor.name"
        >
          <template #prepend>
            <v-icon icon="mdi-book-open-variant" color="primary"></v-icon>
          </template>
        </v-list-item>
        <!-- 二级和三级：年级 + 课程 -->
        <template v-if="currentMajor">
          <template v-for="grade in gradeList" :key="grade.value">
            <v-list-item
              class="grade-item"
              :title="grade.label"
              @click="toggleGrade(grade.value)"
            >
              <template #prepend>
                <v-icon>
                  {{ expandedGrade === grade.value ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                </v-icon>
              </template>
            </v-list-item>
            <div v-if="expandedGrade === grade.value">
              <v-list-item
                v-for="course in getCoursesByGrade(grade.value)"
                :key="course.course_id"
                :title="course.course_name"
                class="course-item"
                @click.stop="navigateToCourse(course)"
              >
                <template #prepend>
                  <v-icon icon="mdi-book" size="small"></v-icon>
                </template>
              </v-list-item>
            </div>
          </template>
        </template>
      </v-list>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

interface MajorItem {
  major_id: string;
  school: string;
  name: string;
}

interface CourseItem {
  major_id: string;
  course_id: string | number;
  course_name: string;
  grade?: number;
  direction?: string;
  teachers?: string[];
  link?: string;
  proposal?: string;
  credit?: number;
  class?: string;
  doc_str?: string;
}

const router = useRouter();
const route = useRoute();
const allMajors = ref<MajorItem[]>([]);
const allCourses = ref<CourseItem[]>([]);
const expandedGrade = ref<number | null>(null);

// 年级列表
const gradeList = [
  { value: 1, label: '大一' },
  { value: 2, label: '大二' },
  { value: 3, label: '大三' },
  { value: 4, label: '大四' }
];

// 根据当前路径获取专业ID
const currentMajorId = computed(() => {
  if (route.path.startsWith('/docs/')) {
    return route.params.major as string;
  }
  return null;
});

// 当前专业信息
const currentMajor = computed(() => {
  if (!currentMajorId.value) return null;
  return allMajors.value.find(major => major.major_id === currentMajorId.value);
});

// 根据年级获取课程
const getCoursesByGrade = (grade: number) => {
  if (!currentMajorId.value) return [];
  return allCourses.value.filter(course => 
    course.major_id === currentMajorId.value && course.grade === grade
  );
};

function toggleGrade(grade: number) {
  expandedGrade.value = expandedGrade.value === grade ? null : grade;
}

const navigateToCourse = (course: CourseItem) => {
  // 这里可以添加课程跳转逻辑
  console.log('选择课程:', course);
};

onMounted(async () => {
  try {
    const [majors, courses] = await Promise.all([
      $fetch<MajorItem[]>('/api/searchSchool', { method: 'POST', body: { keyword: '' } }),
      $fetch<CourseItem[]>('/api/courses')
    ]);
    allMajors.value = majors;
    allCourses.value = courses;
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
});

// 监听路由变化，自动展开对应年级
watch(() => route.path, (newPath) => {
  if (newPath.startsWith('/docs/')) {
    const pathParts = newPath.split('/');
    if (pathParts.length >= 4) {
      const gradeParam = pathParts[3];
      const grade = Number(gradeParam);
      if (!isNaN(grade) && grade >= 1 && grade <= 4) {
        expandedGrade.value = grade;
      }
    }
  }
}, { immediate: true });
</script>

<style scoped>
.sidebar {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 8px 8px 0 0;
}
.sidebar-toggle-btn {
  margin-left: auto;
}
.sidebar-content {
  flex: 1;
  overflow-y: auto;
}
.major-item {
  font-weight: 600;
  color: #1976d2;
  background-color: #f5f5f5;
}
.grade-item {
  padding-left: 16px;
  font-weight: 500;
  color: #1976d2;
  cursor: pointer;
}
.grade-item:hover {
  background-color: rgba(25, 118, 210, 0.06);
}
.course-item {
  padding-left: 32px;
  font-size: 0.95rem;
  color: #333;
  cursor: pointer;
}
.course-item:hover {
  background-color: rgba(25, 118, 210, 0.08);
}

</style> 