<template>
    <div style="height: 100%;" ref="totalSpace">
        <v-breadcrumbs>
            <v-breadcrumbs-item to="/edit">编辑专业</v-breadcrumbs-item>
            <v-breadcrumbs-divider/>
            <v-breadcrumbs-item :to="`/edit/${$route.params.major}`">编辑课程</v-breadcrumbs-item>
            <v-breadcrumbs-divider/>
            <v-breadcrumbs-item :disabled="true" >编辑文档</v-breadcrumbs-item>
        </v-breadcrumbs>
        <v-row class="ml-1 mr-1" ref="row1Space">
            <v-col>
                <v-text-field variant="outlined" hide-details label="课程名称" density="compact"
                    v-model="newCourse.course_name" />
            </v-col>
            <v-col>
                <v-btn-toggle v-model="toggle" divided>
                    <v-btn value="unique">
                        <span class="hidden-sm-and-down">独立页面</span>

                        <v-icon end>
                            mdi-format-align-left
                        </v-icon>
                    </v-btn>

                    <v-btn value="other">
                        <span class="hidden-sm-and-down">使用已有文档</span>

                        <v-icon end>
                            mdi-open-in-new
                        </v-icon>
                    </v-btn>
                </v-btn-toggle>
            </v-col>
        </v-row>
        <v-form v-model="infoValid">
            <v-row class="ml-1 mr-1 " ref="row2Space">
                <v-col>
                    <v-number-input :precision="1" :step="0.5" controlVariant="split" label="学分" :hideInput="false"
                        :inset="false" variant="outlined" v-model="newCourse.credit" density="compact"></v-number-input>
                </v-col>

                <v-col>
                    <v-combobox :items="classNames" variant="outlined" density="compact" v-model="newCourse.class"
                        label="类型" />
                </v-col>

                <v-col>
                    <v-combobox :items="gradeName" variant="outlined" density="compact" v-model="grade" label="年级"
                        :rules="[checkGrade]" />
                </v-col>

                <v-col>
                    <v-text-field variant="outlined" v-model="newCourse.direction" label="专业方向" hint="不区分方向则留空"
                        density="compact" />
                </v-col>
            </v-row>
        </v-form>
        <v-row justify="center" class="ml-1 mr-1" v-show="toggle == 'unique'">
            <v-col>
                <v-card class="flex-grow-1">
                    <v-tabs v-model="tab" bg-color="primary" density="compact">
                        <v-tab value="editor">编辑</v-tab>
                        <v-tab value="preview">预览</v-tab>
                    </v-tabs>
                    <v-card-text>
                        <v-tabs-window v-model="tab">
                            <v-tabs-window-item value="editor">
                                <MonacoEditor :style="`height: ${editorHeight}px`" v-model="newCourse.doc_str"
                                    lang="markdown" />
                            </v-tabs-window-item>

                            <v-tabs-window-item value="preview" class="overflow-x-auto"
                                :style="`height: ${editorHeight}px`">
                                <MDC :value="newCourse?.doc_str" />
                            </v-tabs-window-item>

                        </v-tabs-window>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-form v-model="linkValid">
            <v-row justify="center" class="ml-1 mr-1" v-show="toggle == 'other'">
                <v-col>
                    <v-combobox label="学院" variant="solo-filled" :items="schools" v-model="link.school"
                        :rules="[checkSchool]" @update:model-value="getCourses" />
                </v-col>
                <v-col>
                    <v-combobox label="专业" variant="solo-filled" :items="majorOfSchool" v-model="link.major"
                        :rules="[checkMajorInSchool]" @update:model-value="getCourses" />
                </v-col>
                <v-col>
                    <v-combobox label="课程" variant="solo-filled" v-model="link.course" :items="courseItems"
                        :loading="loadingCourses" :rules="[checkCourse]" />
                </v-col>
            </v-row>
        </v-form>

        <v-row class="ml-4 mr-4 mt-4" ref="row3Space" v-show="toggle == 'unique'">
            <v-combobox chips multiple variant="outlined" density="compact" label="任课教师" v-model="newCourse.teachers"
                hide-details />
        </v-row>
        <v-row class="ml-4 mr-4" ref="row4Space" justify="end">
            <!-- <v-col> -->
            <v-btn class="mt-2" :disabled="!infoValid || (toggle == 'other' && !linkValid)" color="primary" variant="tonal">提交</v-btn>
            <!-- </v-col> -->
        </v-row>
        <v-navigation-drawer location="right">
            <v-file-input label="上传附件" variant="outlined" density="compact" class="ma-2" v-show="toggle == 'unique'" />
            <v-divider />
        </v-navigation-drawer>
    </div>
</template>

<script setup lang="ts">
import type { VTabs } from 'vuetify/components';
import type { VRow } from 'vuetify/components/VGrid';

const route = useRoute();
const majorId = route.params.major;
const docId = route.params.doc;

const props = defineProps<{ majors: Major[] }>();

const tab = ref<"preview" | "editor">("editor");

const toggle = ref<"unique" | "other">("unique");

const row1Space = ref<null | VRow>(null);
const row2Space = ref<null | VRow>(null);
const row3Space = ref<null | VRow>(null);
const row4Space = ref<null | VRow>(null);
const totalSpace = ref<null | HTMLDivElement>(null);

/** 
 * 计算得出编辑器应有大小。
 */
const editorHeight = ref(0);

onMounted(() => {
    nextTick(() => {
        const totalHeight = totalSpace.value?.clientHeight || 0;
        const row1Height = row1Space.value?.$el.offsetHeight || 0;
        const row2Height = row2Space.value?.$el.offsetHeight || 0;
        const row3Height = row3Space.value?.$el.offsetHeight || 0;
        const row4Height = row4Space.value?.$el.offsetHeight || 0;

        console.log(`${row1Height} ${row2Height} ${row3Height}`)
        editorHeight.value = totalHeight - row1Height * 1.5 - row2Height * 1.5 - row3Height * 1.5 - row4Height * 1.5;
        editorHeight.value *= 0.9;
    });

});

const classNames = ["必修", "公共", "限选"];

/**
 * 选择使用已有文档时对应的专业和课程
 */
const link = ref({
    school: "",
    major: "",
    course: "",
})

/**
 * 检查选择的学院是否正确
 */
const checkSchool = (s: string) => {
    if (props.majors.find(m => m.school == s))
        return true;
    return "没有这个学院";
};

const schools = computed(() => {
    const l = props.majors.map(m => m.school);
    return Array.from(new Set(l));
});

const getMajorId = (school: string, major: string) => {
    const res = props.majors.find(m => m.name == major && m.school == school);
    if (res)
        return res.major_id;
    return res;
};

/**
 * 检查使用已有文档时选择的专业是否在学院里
 */
const checkMajorInSchool = (s: string) => {
    if (props.majors.find(m => m.school == link.value.school && m.name == s))
        return true;
    return "没有这个专业";
};

const checkCourse = (s: string) => {
    if (courseItems.value?.find(c => c == s))
        return true;
    return "没有这门课";
}

const majorOfSchool = computed(() => {
    return props.majors.filter(m => m.school == link.value.school).map(m => m.name);
})

/**
 * 用户填写的年级
 * @note 需要转换成对应年级编号才可使用
 */
const grade = ref("");

/**
 * 要申请的课程信息
 * @note 一些值因为绑定不符合最终格式，在发送请求的时候要修改。
 */
const newCourse = ref<Course>({
    major_id: "",
    grade: 0,
    course_name: "",
    direction: "",
    proposal: null,
    credit: 0,
    class: "",
    course_id: "",
    doc_str: "",
    link: null,
    teachers: [],
});


/**
 * 获得当前选择课程的具体信息
 */
const { data: course } = await useAsyncData(`major-${majorId}-${docId}`, () =>
    $fetch<Course>("/api/courses/doc", {
        method: "GET",
        query: {
            major: majorId,
            course: docId == "new" ? undefined : docId
        }
    })
);

const infoValid = ref(false);
const linkValid = ref(false);

/**
 * 选择使用已有课程时，控制课程是否显示加载中。
 */
const loadingCourses = ref(false);

/**
 * 选择使用已有课程时，获得的对应专业课程列表。
 */
const courseItems = ref<string[]>();


const checkGrade = (s: string) => {
    if (gradeName.findIndex(v => v == s) != -1)
        return true;
    return "请选择具体学期或选择概述";
};

/**
 * 选择使用已有文档时，根据专业查询该专业课程。
 */
const getCourses = () => {
    const id = getMajorId(link.value.school, link.value.major);
    if (id == undefined) {
        link.value.course = "";
        courseItems.value = [];
        return;
    }
    loadingCourses.value = true;
    $fetch("/api/courses", {
        method: "GET",
        query: {
            major: id
        }
    }).then(res => {
        console.log(id);
        console.log(res);
        courseItems.value = res.map(c => c.course_name);
        loadingCourses.value = false;
    });
};

// 将选择的 grade 转换成对应编号。
watch(grade, () => {
    const index = gradeName.findIndex(s => s == grade.value);
    if (index != -1)
        newCourse.value.grade = index;
});

// 获得课程信息后更新申请课程信息
watch(course, (newCourseData) => {
    if (newCourseData) {
        newCourse.value = newCourseData;
        grade.value = gradeName[newCourseData.grade];
        if (newCourseData.link) {
            const counter = props.majors.find(m => m.major_id == newCourseData.major_id);
            if (counter)
                link.value = { school: counter?.school, major: counter?.name, course: newCourseData.course_name };
            toggle.value = "other";
        }
    }
}, { immediate: true });
</script>