<template>
    <div class="fill-height">
        <v-navigation-drawer permanent class="position-fixed" v-if="listItems">
            <v-list v-if="Number(majorId) != 0">
                <v-list-group v-for="(gradeCourses, index) in listItems" v-show="gradeCourses.length" :key="index"
                    :value="index">
                    <!-- eslint-disable-next-line vue/no-template-shadow -->
                    <template #activator="{ props }">
                        <v-list-item v-bind="props" :title="gradeName[index]" />
                    </template>
                    <div v-for="(classAndCourses, i) in gradeCourses" :key="i">
                        <v-divider />
                        <v-list-subheader v-if="classAndCourses[0] "> {{ classAndCourses[0] }}</v-list-subheader>
                        <v-list-item v-for="course in classAndCourses[1]" :key="course.course_id"
                            :title="course.course_name" :active="Number($route.params.doc) == course.course_id"
                            @click="navigateTo(`/edit/${route.params.major}/${course.course_id}`)" />
                    </div>
                </v-list-group>
            </v-list>
            <v-list v-else>
                <v-list-item v-for="course in listItems[0][0][1]" :key="course.course_id" :title="course.course_name"
                    :active="Number($route.params.doc) == course.course_id"
                    @click="navigateTo(`/edit/${route.params.major}/${course.course_id}`)" />
            </v-list>
        </v-navigation-drawer>
        <NuxtPage :majors="props.majors" class="fill-height" />
        <div v-if="$route.params.doc == undefined">

            <v-breadcrumbs>
                <v-breadcrumbs-item to="/edit">编辑专业</v-breadcrumbs-item>
                <v-breadcrumbs-divider />
                <v-breadcrumbs-item :disabled="true">编辑课程</v-breadcrumbs-item>
            </v-breadcrumbs>
            <v-row justify="center">
                <v-col cols="12" md="6" lg="4" xl="4">
                    <v-card title="申请删除课程" variant="outlined">
                        <v-card-text>
                            <v-form v-model="courseValid">
                                <v-combobox v-model="delCourse.name" label="课程" variant="outlined" density="compact"
                                    :rules="[checkCourse]" :items="courseNames" />
                                <v-text-field v-model="delCourse.reason" density="compact" label="删除理由"
                                    variant="outlined" />
                            </v-form>
                        </v-card-text>
                        <v-card-actions class="justify-center">
                            <v-btn color="primary" :disabled="!courseValid" @click="proposeDelete">
                                提交申请
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
            <v-row justify="center">
                <v-col cols="12" md="6" lg="4" xl="4">
                    <v-card variant="outlined">
                        <v-card-text class="d-flex justify-center">
                            <v-btn size="x-large" variant="text"
                                @click="navigateTo(`/edit/${$route.params.major}/new`)">新建课程</v-btn>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
            <v-row justify="center">
                <v-col cols="12" md="6" lg="4" xl="4">
                    <v-alert text="左侧选择具体专业可编辑专业课程文档" title="提示" type="info" variant="tonal" />
                </v-col>
            </v-row>
        </div>

        <v-snackbar v-model="successSnakebar" :timeout="2000" color="success" variant="tonal">
            提交成功
        </v-snackbar>
        <v-snackbar v-model="errorSnakebar" :timeout="2000" color="error" variant="tonal">
            {{ errorPrompt }}
        </v-snackbar>
    </div>
</template>

<script setup lang="ts">
import type { CourseInfo } from '~/utils/types';
const route = useRoute();
const majorId = route.params.major;

const props = defineProps<{ majors: Major[] }>();

const delCourse = ref({ name: "", reason: "" });


const courseNames = ref<string[]>([]);
const checkCourse = (v: string) => {
    if (courseNames.value.find(s => s == v))
        return true;
    return "没有这门课";
}
const courseValid = ref(false);

const errorPrompt = ref("");
const errorSnakebar = ref(false);
const successSnakebar = ref(false);

const proposeDelete = () => {
    $fetch("/api/courses/propose-del", {
        method: "POST",
        body: {
            major_id: majorId,
            course_name: delCourse.value.name,
            reason: delCourse.value.name,
        }
    })
        .then(() => { successSnakebar.value = true; })
        .catch((err) => {
            errorPrompt.value = err.data.message;
            errorSnakebar.value = true;
        })
};

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
            courseNames.value.push(course.course_name);
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
</script>