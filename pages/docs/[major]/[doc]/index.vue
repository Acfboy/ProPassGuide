<template>
  <div class="docs-layout">
    <div class="custom-sidebar">
      <div class="sidebar-header">
        <v-btn icon variant="text" class="sidebar-toggle-btn">
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </div>
      <v-divider></v-divider>
      <v-list density="compact" nav>
        <v-list-item
          prepend-icon="mdi-home"
          title="首页"
          value="home"
          @click="navigateToHome"
        ></v-list-item>
      </v-list>
      <v-divider></v-divider>
      <div class="sidebar-content">
        <v-list density="compact" nav>
          <!-- 一级：当前专业 -->
          <v-list-item
            v-if="majorName"
            class="major-item"
            :title="majorName"
          >
            <template #prepend>
              <v-icon icon="mdi-book-open-variant" color="primary"></v-icon>
            </template>
          </v-list-item>
          <!-- 二级和三级：年级 + 课程 -->
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
                @click.stop="selectCourse(course)"
              >
                <template #prepend>
                  <v-icon icon="mdi-book" size="small"></v-icon>
                </template>
              </v-list-item>
            </div>
          </template>
        </v-list>
      </div>
    </div>
    <div class="docs-content">
      <!-- 原有内容区域 -->
      <div class="courses-container">
        <div class="courses-header">
          <h2 class="courses-title">
            <v-icon icon="mdi-book-open-variant" class="mr-2"></v-icon>
            {{ majorName }} - {{ grade ? `${grade}年级` : '全部年级' }} 课程
          </h2>
          <p class="courses-subtitle">共 {{ courses.length }} 门课程</p>
        </div>
        <div class="courses-grid">
          <v-card
            v-for="course in courses"
            :key="course.course_id"
            class="course-card"
            elevation="2"
            hover
            @click="viewCourseDetail(course)"
          >
            <v-card-title class="course-title">
              <v-icon icon="mdi-book" class="mr-2" color="primary"></v-icon>
              {{ course.course_name }}
            </v-card-title>
            <v-card-text class="course-content">
              <div class="course-info">
                <div class="info-item">
                  <v-icon icon="mdi-school" size="small" class="mr-1"></v-icon>
                  <span class="info-label">年级:</span>
                  <span class="info-value">{{ course.grade || '未设置' }}</span>
                </div>
                <div class="info-item">
                  <v-icon icon="mdi-account-group" size="small" class="mr-1"></v-icon>
                  <span class="info-label">教师:</span>
                  <span class="info-value">{{ course.teachers?.join(', ') || '未设置' }}</span>
                </div>
                <div class="info-item">
                  <v-icon icon="mdi-star" size="small" class="mr-1"></v-icon>
                  <span class="info-label">学分:</span>
                  <span class="info-value">{{ course.credit || '未设置' }}</span>
                </div>
                <div class="info-item">
                  <v-icon icon="mdi-tag" size="small" class="mr-1"></v-icon>
                  <span class="info-label">类型:</span>
                  <span class="info-value">{{ course.class || '未设置' }}</span>
                </div>
              </div>
              <div v-if="course.doc_str" class="course-description">
                <p>{{ course.doc_str }}</p>
              </div>
            </v-card-text>
            <v-card-actions class="course-actions">
              <v-chip
                :color="course.class === '必修' ? 'error' : 'success'"
                size="small"
                variant="outlined"
              >
                {{ course.class || '未分类' }}
              </v-chip>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                variant="text"
                size="small"
                @click.stop="viewCourseDetail(course)"
              >
                查看详情
                <v-icon icon="mdi-arrow-right" size="small" class="ml-1"></v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </div>
        <div v-if="courses.length === 0" class="no-courses">
          <v-icon icon="mdi-book-off" size="large" color="grey"></v-icon>
          <p>暂无课程数据</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface CourseItem {
  major_id: string;
  course_id: string | number;
  course_name: string;
  direction?: string;
  grade?: number;
  teachers?: string[];
  link?: string;
  proposal?: string;
  credit?: number;
  class?: string;
  doc_str?: string;
}

interface MajorItem {
  major_id: string;
  school: string;
  name: string;
}

const route = useRoute();
const router = useRouter();
const majorId = route.params.major as string;
const grade = computed(() => {
  const g = route.params.doc;
  return g && !isNaN(Number(g)) ? Number(g) : null;
});
const courses = ref<CourseItem[]>([]);
const allMajors = ref<MajorItem[]>([]);
const expandedGrade = ref<number | null>(null);

const majorName = computed(() => {
  const major = allMajors.value.find(m => m.major_id === majorId);
  return major?.name || '未知专业';
});

const gradeList = [
  { value: 1, label: '大一' },
  { value: 2, label: '大二' },
  { value: 3, label: '大三' },
  { value: 4, label: '大四' }
];

function toggleGrade(grade: number) {
  expandedGrade.value = expandedGrade.value === grade ? null : grade;
}

function getCoursesByGrade(grade: number) {
  return courses.value.filter(c => c.grade === grade);
}

function selectCourse(course: CourseItem) {
  router.push(`/docs/${majorId}/${route.params.doc}/${course.course_id}`);
}

function navigateToHome() {
  router.push('/');
}

function viewCourseDetail(course: CourseItem) {
  router.push(`/docs/${majorId}/${route.params.doc}/${course.course_id}`);
}

onMounted(async () => {
  // 获取所有课程和专业
  const [allCourses, majors] = await Promise.all([
    $fetch<CourseItem[]>('/api/courses'),
    $fetch<MajorItem[]>('/api/searchSchool', { method: 'POST', body: { keyword: '' } })
  ]);
  allMajors.value = majors;
  // 只保留当前专业的课程
  let filtered = allCourses.filter((c) => c.major_id === majorId);
  if (grade.value !== null) {
    filtered = filtered.filter((c) => c.grade === grade.value);
  }
  courses.value = filtered;
});
</script>

<style scoped>
.custom-sidebar {
  position: fixed;
  left: 0;
  top: 64px;
  bottom: 64px;
  width: 260px;
  max-width: 320px;
  border-right: 1px solid #eee;
  background: #fff;
  z-index: 100;
  height: auto;
  overflow-y: auto;
}
.docs-content {
  margin-left: 260px;
  padding: 32px 24px 24px 24px;
  overflow: auto;
}
.courses-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.courses-header {
  margin-bottom: 32px;
  text-align: center;
}

.courses-title {
  font-size: 2rem;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.courses-subtitle {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.course-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.course-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1976d2;
  padding: 20px 20px 12px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
}

.course-content {
  padding: 16px 20px;
}

.course-info {
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.info-label {
  font-weight: 500;
  color: #666;
  margin-right: 8px;
  min-width: 40px;
}

.info-value {
  color: #333;
  flex: 1;
}

.course-description {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.course-description p {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.course-actions {
  padding: 12px 20px 20px 20px;
  background-color: #fafafa;
}

.no-courses {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.no-courses p {
  margin-top: 16px;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .courses-container {
    padding: 16px;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .course-card {
    margin-bottom: 16px;
  }
}
</style> 