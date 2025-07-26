<template>
    <div>
        <v-row justify="center" class="ma-2">
            <v-col cols="12" md="9" xl="6" lg="9">
                <v-sheet>
                    <v-row>
                        <v-col>
                            <p class="text-h4 mb-2">{{ course?.course_name }}</p>
                        </v-col>
                        <div class="ma-4">
                            <v-icon icon="mdi-file-edit-outline" @click="navigateTo(`/edit/${majorId}/${docId}`)" />
                        </div>
                    </v-row>
                    <v-chip v-if="course?.grade" class="mr-1" density="compact" color="green">
                        <v-icon icon="mdi-star" class="mr-1" />
                        学分：{{ course?.credit }}
                    </v-chip>
                    <v-chip v-if="course?.class" class="mr-1" density="compact" color="primary">
                        <v-icon icon="mdi-label-outline" class="mr-1" />
                        {{ course?.class }}
                    </v-chip>
                    <v-chip v-if="course?.direction" class="mr-1" density="compact" color="orange">

                        <v-icon icon="mdi-directions-fork" class="mr-1" />
                        专业方向：{{
                            course?.direction
                        }}
                    </v-chip>

                    <div class="article">
                        <MDC v-if="course" class="mt-4" :value="course?.doc_str" tag="article" />
                    </div>

                    <v-divider class="mt-6" />

                    <v-sheet style="border-left: red solid 4px;" class="mt-6 pl-4" variant="text">
                        <span>
                            <p class="text-disabled">
                                <v-icon class="mr-1">mdi-pencil</v-icon>
                                发现错误？想一起完善？
                                <a style="color: blue" class="text-decoration-none cursor-pointer"
                                    @click="navigateTo(`/edit/${majorId}/${docId}`)">编辑此页</a>
                            </p>

                            <p class="text-disabled">
                                <v-icon class="mr-1">mdi-code-braces</v-icon>
                                网站功能不够完善，我想贡献！
                                <a href="https://github.com/Acfboy/ProPassGuide" class=" text-decoration-none">在 Github
                                    上贡献代码</a>
                            </p>
                        </span>
                    </v-sheet>
                </v-sheet>
            </v-col>

        </v-row>
        <v-navigation-drawer floating location="right" class="position-fixed">
            <template #prepend>
                <p class="text-h6 mt-4">目录</p>
            </template>
            <div v-if="toc && toc.length" class="toc-container mt-4">
                <ul class="toc-list">
                    <li v-for="item in toc" :key="item.id" :class="{ 'active-toc': activeTocId === item.id }"
                        :style="{ paddingLeft: (item.depth - 1) * 16 + 'px' }">
                        <a @click.prevent="scrollToAnchor(item.id)">{{ item.text }}</a>
                    </li>
                </ul>
            </div>
        </v-navigation-drawer>
    </div>

</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
const majorId = route.params.major as string;
const docId = route.params.doc as string;

const requestFetch = useRequestFetch();

/**
 * 获得当前选择课程的具体信息
 */
const { data: course } = await useAsyncData(`major-${majorId}-${docId}`, () =>
    requestFetch<CourseWithDbId>("/api/courses/doc", {
        method: "GET",
        query: {
            major: majorId,
            course: docId == "new" ? undefined : docId
        }
    })
);

if (course.value?.link) {
    course.value = await
        requestFetch<CourseWithDbId>("/api/courses/doc", {
            method: "GET",
            query: {
                major: course.value.link.major_id,
                course: course.value.link.course_id,
            }
        })
}

interface CatalogItem {
  id: string;
  depth: number;
  text: string;
  children?: CatalogItem[];
}

const flattenCatalog = (items: CatalogItem[]): CatalogItem[] => {
  const result: CatalogItem[] = [];
  
  const traverse = (currentItems: CatalogItem[]) => {
    currentItems.forEach(item => {
      const { children, ...itemWithoutChildren } = item;
      result.push(itemWithoutChildren);
      
      if (children && children.length > 0) {
        traverse(children);
      }
    });
  };
  
  traverse(items);
  return result;
};

const { data: toc } = useAsyncData(`parse-${majorId}-${docId}`, () => parseMarkdown(course.value?.doc_str ?? "", { toc: { depth: 4 } }).then(res => flattenCatalog(res.toc?.links ?? [])));

const activeTocId = ref('');

function updateActiveToc() {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')) as HTMLElement[];
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

<style>
h2 a,
h3 a,
h4 a,
h5 a,
h6 a {
    color: black;
    font-weight: 500;
    text-decoration: none;
}

h1,
h2,
h3,
h4,
h5,
h6 {
    margin-bottom: 0.5em;
    margin-top: 0.5em;
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
    margin-left: 0;
    padding-left: 16px;
    border-left: rgba(192, 192, 192, 0.788) solid 2px;
    font-size: 0.98rem;
}

.toc-list a {
    color: rgb(49, 49, 49);
    text-decoration: none;
    transition: color 0.2s;
    cursor: pointer;
    padding: 2px 6px;
    display: inline-block;
}

.toc-list a:hover {
    color: #1565c0;
}

.toc-list li.active-toc a {
    color: #1565c0;
}

.toc-list li.active-toc {
    padding-left: 16px;
    border-left: #1565c0 solid 2px;
    font-size: 0.98rem;
}

.article p {
    line-height: 1.8;
    margin-top: 1em;
}


.article svg {
    margin-top: 1em;
}

.article hr {
    margin-top: 1em;
}

.article .shiki {
    margin-top: 1em;
}

.article .language-text {
    margin-top: 1em;
}

.article li {
    line-height: 1.8;
    margin-left: 1em;
    margin-top: 0.5em;
}
</style>