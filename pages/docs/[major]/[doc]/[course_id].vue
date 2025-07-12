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
    <div class="docs-content with-toc">
      <!-- {{ courseDetail }} -->
      <div class="course-mdc-content">
        <div>
          <MDC :value="courseDetail" tag="article" />
        </div>
      </div>
      <div class="toc-container" v-if="toc.length">
        <div class="toc-title">目录</div>
        <ul class="toc-list">
          <li v-for="item in toc" :key="item.id" :style="{ marginLeft: (item.level - 1) * 16 + 'px' }">
            <a
              :class="{ 'active-toc': activeTocId === item.id }"
              href="javascript:void(0)"
              @click.prevent="scrollToAnchor(item.id)"
            >{{ item.text }}</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
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

interface TocItem {
  level: number;
  text: string;
  id: string;
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

const { data: courseDetail } = useAsyncData<string>(`get-${route.params.course_id}`, () => {
  const courseId = route.params.course_id as string;
  return $fetch<string>(`/api/courseDetail`, {
    method: "GET",
    query: {
      course_id: courseId
    }
  });
});



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

  // 课程详情内容
  // const courseId = route.params.course_id as string;
  // if (courseId) {
  //   courseDetail.value = await $fetch(`/api/courseDetail?course_id=${courseId}`);
  // }

});

watch(() => route.params.course_id, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    window.location.reload();
  }
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '')
    .replace(/\-+/g, '-')
    .replace(/^\-+|\-+$/g, '');
}

// 目录（TOC）相关
const toc = ref<TocItem[]>([]);
const activeTocId = ref('');

watch(
  () => courseDetail.value as string,
  async (val) => {
    if (!val) {
      toc.value = [];
      return;
    }
    // 提取 markdown 标题生成 toc
    const lines = (val as string).split('\n');
    const headingRE = /^(#{1,6})\s+(.+)/;
    toc.value = lines
      .map((line): TocItem | null => {
        const match = line.match(headingRE);
        if (match) {
          return {
            level: match[1].length,
            text: match[2].trim(),
            id: match[2].trim().toLowerCase().replace(/\s+/g, '-')
          };
        }
        return null;
      })
      .filter((item): item is TocItem => !!item);
    // 渲染后为标题动态添加 id
    await nextTick();
    toc.value.forEach(item => {
      const selector = `.course-mdc-content h${item.level}`;
      const headings = document.querySelectorAll(selector);
      headings.forEach(heading => {
        if (heading.textContent && heading.textContent.trim() === item.text) {
          heading.id = item.id;
        }
      });
    });
    // 渲染后去除标题下的 <a> 标签，仅保留文本
    await nextTick();
    const contentRoot = document.querySelector('.course-mdc-content');
    if (contentRoot) {
      for (let level = 1; level <= 6; level++) {
        const headings = contentRoot.querySelectorAll(`h${level} > a`);
        headings.forEach(a => {
          const h = a.parentElement;
          if (h && h.tagName.toLowerCase() === `h${level}`) {
            h.replaceChild(document.createTextNode(a.textContent || ''), a);
          }
        });
      }
    }
  },
  { immediate: true }
);

function updateActiveToc() {
  const headings = Array.from(document.querySelectorAll('.course-mdc-content h1, .course-mdc-content h2, .course-mdc-content h3, .course-mdc-content h4, .course-mdc-content h5, .course-mdc-content h6')) as HTMLElement[];
  const scrollY = window.scrollY || window.pageYOffset;
  const headerOffset = 120; // 头部高度+间距
  let currentId = '';
  for (let i = 0; i < headings.length; i++) {
    const el = headings[i];
    if (el.offsetTop - headerOffset <= scrollY) {
      currentId = el.id;
    } else {
      break;
    }
  }
  activeTocId.value = currentId;
  // 目录自动滚动到激活项
  nextTick(() => {
    const activeLink = document.querySelector('.toc-list .active-toc');
    const tocContainer = document.querySelector('.toc-container');
    if (activeLink && tocContainer) {
      const linkRect = activeLink.getBoundingClientRect();
      const containerRect = tocContainer.getBoundingClientRect();
      if (linkRect.top < containerRect.top || linkRect.bottom > containerRect.bottom) {
        activeLink.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  });
}

onMounted(() => {
  window.addEventListener('scroll', updateActiveToc, { passive: true });
  nextTick(updateActiveToc);
});

function scrollToAnchor(id: string) {
  const el = document.getElementById(id);
  if (el) {
    const headerOffset = 112; // header高度
    const y = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}
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
.docs-layout {
  display: flex;
  flex-direction: row;
}
.docs-content.with-toc {
  margin-left: 100px;
  padding: 32px 24px 24px 24px;
  overflow: auto;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
}
.course-mdc-content {
  max-width: 900px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(25, 118, 210, 0.08);
  padding: 40px 32px;
  flex: 1 1 0;
}
.course-mdc-content h1 {
  font-size: 2.4rem;
  color: #1976d2;
  border-left: 6px solid #1976d2;
  padding-left: 18px;
  margin-top: 2.5em;
  margin-bottom: 1.3em;
  background: #f5faff;
  border-radius: 8px;
  font-weight: 800;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.06);
}
.course-mdc-content h2 {
  font-size: 1.8rem;
  color: #1565c0;
  border-left: 4px solid #90caf9;
  padding-left: 14px;
  margin-top: 2em;
  margin-bottom: 1em;
  background: #f7fbff;
  border-radius: 6px;
  font-weight: 700;
}
.course-mdc-content h3 {
  font-size: 1.3rem;
  color: #1976d2;
  margin-top: 1.5em;
  margin-bottom: 0.8em;
  font-weight: 600;
}
.course-mdc-content h4 {
  font-size: 1.1rem;
  color: #1976d2;
  margin-top: 1.2em;
  margin-bottom: 0.6em;
  font-weight: 600;
}
.course-mdc-content ul,
.course-mdc-content ol {
  margin: 1em 0 1em 2em;
  padding-left: 1.5em;
}
.course-mdc-content li {
  margin-bottom: 0.5em;
  font-size: 1.08rem;
  line-height: 2.0;
}
.course-mdc-content p {
  font-size: 1.1rem;
  color: #333;
  line-height: 2.2;
  margin: 1.2em 0;
}
.course-mdc-content strong {
  color: #1976d2;
  font-weight: bold;
}
.course-mdc-content em {
  color: #1565c0;
  font-style: italic;
}
.course-mdc-content blockquote {
  border-left: 4px solid #90caf9;
  background: #f5faff;
  color: #1976d2;
  margin: 2em 0;
  padding: 1.2em 2em;
  border-radius: 8px;
  font-style: italic;
  line-height: 2.1;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.04);
}
.course-mdc-content pre {
  background: #23272e;
  color: #fff;
  border-radius: 8px;
  padding: 1.4em;
  overflow-x: auto;
  font-size: 1.06rem;
  margin: 2em 0;
  line-height: 2.0;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.08);
}
.course-mdc-content code {
  background: #f4f4f4;
  color: #c7254e;
  border-radius: 4px;
  padding: 0.2em 0.4em;
  font-size: 0.98em;
}
.course-mdc-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 1.5em 0;
  background: #fafbfc;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.04);
}
.course-mdc-content th,
.course-mdc-content td {
  border: 1px solid #e3eaf2;
  padding: 0.6em 1em;
  text-align: left;
}
.course-mdc-content th {
  background: #e3eaf2;
  font-weight: 600;
}
.course-mdc-content img {
  max-width: 100%;
  border-radius: 8px;
  margin: 1em 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.course-mdc-content hr {
  border: none;
  border-top: 2px dashed #e3eaf2;
  margin: 2em 0;
}
.toc-container {
  position: fixed;
  top: 90px;
  right: 48px;
  width: 240px;
  background: #fafbfc;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 18px 16px;
  max-height: 80vh;
  overflow: auto;
  margin-left: 40px;
  z-index: 150;
}
@media (max-width: 1200px) {
  .toc-container {
    right: 8px;
  }
}
.toc-title {
  font-weight: bold;
  margin-bottom: 12px;
  color: #1976d2;
  font-size: 1.1rem;
}
.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.toc-list li {
  font-size: 0.98rem;
  margin-bottom: 6px;
}
.toc-list a {
  color: #1976d2;
  text-decoration: none;
  transition: color 0.2s;
  cursor: pointer;
  border-radius: 4px;
  padding: 2px 6px;
  display: inline-block;
}
.toc-list a:hover {
  text-decoration: underline;
  color: #1565c0;
  background: #e3eaf2;
}
.toc-list a.active-toc {
  background: #1976d2;
  color: #fff;
  font-weight: bold;
}
@media (max-width: 1024px) {
  .docs-content.with-toc {
    flex-direction: column;
    align-items: stretch;
  }
  .toc-container {
    position: static;
    margin-left: 0;
    margin-top: 24px;
    width: 100%;
    max-width: 100%;
    right: auto;
    top: auto;
    z-index: auto;
  }
}
@media (max-width: 768px) {
  .course-mdc-content {
    padding: 12px 4px;
  }
  .course-mdc-content h1,
  .course-mdc-content h2 {
    font-size: 1.3rem;
    padding-left: 8px;
  }
  .toc-container {
    padding: 8px;
  }
}
.empty-mdc {
  text-align: center;
  color: #aaa;
  font-size: 1.1rem;
  padding: 60px 0;
}
.course-mdc-content h1 > a,
.course-mdc-content h2 > a,
.course-mdc-content h3 > a,
.course-mdc-content h4 > a,
.course-mdc-content h5 > a,
.course-mdc-content h6 > a {
  color: inherit;
  text-decoration: none;
  pointer-events: none;
  cursor: default;
  background: none;
  box-shadow: none;
}
.course-mdc-content h1 > a::before,
.course-mdc-content h2 > a::before,
.course-mdc-content h3 > a::before,
.course-mdc-content h4 > a::before,
.course-mdc-content h5 > a::before,
.course-mdc-content h6 > a::before {
  display: none;
}
</style> 