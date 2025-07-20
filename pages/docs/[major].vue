<template>
    <v-main>
        <v-navigation-drawer v-if="listItems" permanent class="position-fixed">
            <v-list v-if="Number(majorId) != 0" v-model:opened="listOpen">
                <v-list-group v-for="(gradeCourses, index) in listItems" v-show="gradeCourses.length" :key="index"
                    :value="index">
                    <!-- eslint-disable-next-line vue/no-template-shadow -->
                    <template #activator="{ props }">
                        <v-list-item v-bind="props" :title="gradeName[index]" />
                    </template>
                    <div v-for="(classAndCourses, i) in gradeCourses" :key="i">
                        <v-divider />
                        <v-list-subheader v-if="classAndCourses[0]"> {{ classAndCourses[0] }}</v-list-subheader>
                        <v-list-item v-for="course in classAndCourses[1]" :key="course.course_id"
                            :title="course.course_name" :active="Number($route.params.doc) == course.course_id"
                            @click="navigateTo(`/docs/${route.params.major}/${course.course_id}`)" />
                    </div>
                </v-list-group>
            </v-list>
            <v-list v-else>
                <v-list-item v-for="course in listItems[0][0][1]" :key="course.course_id"
                    :title="course.course_name" :active="Number($route.params.doc) == course.course_id"
                    @click="navigateTo(`/docs/${route.params.major}/${course.course_id}`)" />
            </v-list>
        </v-navigation-drawer>
        <NuxtPage />
    </v-main>
</template>

<script setup lang="ts">
import type { CourseInfo } from '~/utils/types';
const route = useRoute();
const majorId = route.params.major;

if (!route.params.doc)
    navigateTo(`/docs/${majorId}/0`);

const requestFetch = useRequestFetch();

/**
 * 分年级和类别的课程列表
 */
const { data: listItems } = await useAsyncData(`major-${majorId}`, () =>
    requestFetch<CourseInfo[]>("/api/courses", {
        method: "GET",
        query: {
            major: majorId
        }
    }).then((res) => {
        const courses: Map<string, CourseInfo[]>[] = Array.from({ length: 9 }, () => new Map());
        res.forEach((course) => {
            if (!courses[course.grade].has(course.class))
                courses[course.grade].set(course.class, [course]);
            else
                courses[course.grade].get(course.class)?.push(course);
        });

        const courseList: ([string, CourseInfo[]][])[] = [];
        for (const i in courses) {
            const gradeCourse: [string, CourseInfo[]][] = courses[i].entries().toArray();
            gradeCourse.sort();
            courseList.push(gradeCourse);
        }

        return courseList;
    })
)

const listOpen = ref<number[]>([]);

if (listItems.value) {
    for (const i in listItems.value) {
        const item = listItems.value[i];
        for (const [_class, courses] of item) {
            if (courses.find(c => c.course_id == Number(route.params.doc)))
                listOpen.value.push(Number(i));
        }
    }
}
</script>