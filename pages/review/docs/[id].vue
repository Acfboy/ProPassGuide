<template>
    <div ref="totalSpace" style="height: 100%;">
        <v-row ref="row1Space" class="ml-1 mr-1 mt-4">
            <v-col>
                <v-text-field v-model="newCourse.course_name" variant="outlined" hide-details label="课程名称"
                    density="compact" />
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
            <v-row ref="row2Space" class="ml-1 mr-1 ">
                <v-col>
                    <v-number-input v-model="newCourse.credit" :precision="1" :step="0.5" control-variant="split"
                        label="学分" :hide-input="false" :inset="false" variant="outlined" density="compact" />
                </v-col>

                <v-col>
                    <v-combobox v-model="newCourse.class" :items="classNames" variant="outlined" density="compact"
                        label="类型" />
                </v-col>

                <v-col>
                    <v-combobox v-model="grade" :items="gradeName" variant="outlined" density="compact" label="年级"
                        :rules="[checkGrade]" />
                </v-col>

                <v-col>
                    <v-text-field v-model="newCourse.direction" variant="outlined" label="专业方向" hint="不区分方向则留空"
                        density="compact" />
                </v-col>
            </v-row>
        </v-form>
        <v-row v-show="toggle == 'unique'" justify="center" class="ml-1 mr-1">
            <v-col>
                <v-card class="flex-grow-1">
                    <v-tabs v-model="tab" bg-color="primary" density="compact">
                        <v-tab value="editor">编辑</v-tab>
                        <v-tab value="preview">预览</v-tab>
                    </v-tabs>
                    <v-card-text>
                        <v-tabs-window v-model="tab">
                            <v-tabs-window-item value="editor">
                                <MonacoEditor v-model="newCourse.doc_str" :style="`height: ${editorHeight}px`"
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
        <!-- <v-form v-model="linkValid">
            <v-row v-show="toggle == 'other'" justify="center" class="ml-1 mr-1">
                <v-col>
                    <v-combobox v-model="link.school" label="学院" variant="solo-filled" :items="schools"
                        :rules="[checkSchool]" @update:model-value="getCourses" />
                </v-col>
                <v-col>
                    <v-combobox v-model="link.major" label="专业" variant="solo-filled" :items="majorOfSchool"
                        :rules="[checkMajorInSchool]" @update:model-value="getCourses" />
                </v-col>
                <v-col>
                    <v-combobox v-model="link.course" label="课程" variant="solo-filled" :items="courseItems"
                        :loading="loadingCourses" :rules="[checkCourse]" />
                </v-col>
            </v-row>
        </v-form> -->

        <v-row v-show="toggle == 'unique'" ref="row3Space" class="ml-4 mr-4 mt-4">
            <v-combobox v-model="newCourse.teachers" chips multiple variant="outlined" density="compact" label="任课教师"
                hide-details />
        </v-row>
        <v-row  class="ml-4 mr-4" justify="end">
            <v-col>
                <v-text-field label="拒绝理由" hide-details density="compact" variant="underlined" ></v-text-field>
            </v-col>
            <v-col>
                <v-btn color="error" block variant="tonal">拒绝</v-btn>
            </v-col>
            <v-spacer/>
            <v-col>
            <!-- <v-btn class="mt-2" :disabled="!infoValid || (toggle == 'other' && !linkValid)" color="primary"
                variant="tonal" @click="submit">提交</v-btn> -->
                <v-btn color="success" block variant="tonal">同意</v-btn>
            </v-col>
        </v-row>
        <v-navigation-drawer location="right">
            <v-divider />
            <v-list line="two">
                <v-list-item v-for="(a, index) in newAttachments" :key="index" :title="a.name" :subtitle="a.timestamp">
                    <template #append>
                        <v-btn icon="mdi-content-copy" variant="text" density="compact" @click="toClipboard(`/api/files/${a.file_id}`)"/>
                    </template>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-snackbar v-model="successSnakebar" :timeout="2000" color="success" variant="tonal">
            提交成功
        </v-snackbar>
        <v-snackbar v-model="errorSnakebar" :timeout="2000" color="error" variant="tonal">
            {{ errorPrompt }}
        </v-snackbar>
    </div>
</template>

<script setup lang="ts">
import type { VTabs } from 'vuetify/components';
import type { VRow } from 'vuetify/components/VGrid';
import useClipboard  from "vue-clipboard3";

const route = useRoute();
const { toClipboard } = await useClipboard();
/**
 * 课程编号
 */
const docId = route.params.id;


const tab = ref<"preview" | "editor">("editor");

const toggle = ref<"unique" | "other">("unique");

const row1Space = ref<null | VRow>(null);
const row2Space = ref<null | VRow>(null);
const row3Space = ref<null | VRow>(null);
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
        editorHeight.value = totalHeight - row1Height * 1.5 - row2Height * 1.5 - row3Height * 1.5;
        editorHeight.value *= 0.9;
    });

});

const classNames = ["必修", "公共", "限选"];



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
    major_id: 0,
    grade: 0,
    course_name: "",
    direction: "",
    proposal: null,
    credit: 0,
    class: "",
    course_id: 0,
    doc_str: "",
    link: null,
    teachers: [],
    _id: ""
});


/**
 * 获得当前选择课程的具体信息
 */
const { data: course } = await useAsyncData(`major-review-${docId}`, () =>
    $fetch<Course>("/api/courses/doc", {
        method: "GET",
        query: {
            major: 0,
            review_id: docId,
        }
    })
);

const checkGrade = (s: string) => {
    if (gradeName.findIndex(v => v == s) != -1)
        return true;
    return "请选择具体学期或选择概述";
};


const successSnakebar = ref(false);
const errorSnakebar = ref(false);
const errorPrompt = ref("");

const submit = () => {
    const { proposal, ...data } = newCourse.value;
    if (toggle.value == "other") {
        data.doc_str = "";
        // data.link = {
        //     major_id: getMajorId(link.value.school, link.value.major)!,
        //     course_id: courseToId.get(link.value.course)!,
        // }
    } else
        data.link = null;

    // $fetch("/api/courses/propose-update", {
    //     method: "POST",
    //     body: {
    //         ...data,
    //         newAttachments: newAttachments.value,
    //     }
    // }).then(() => {
    //     successSnakebar.value = true;
    // }).catch((err) => {
    //     errorPrompt.value = err.data.message;
    //     errorSnakebar.value = true;
    // });
}

const newAttachments = ref<AttachmentInfo[]>([]);


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
    }
}, { immediate: true });

</script>