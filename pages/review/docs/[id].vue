<template>
    <div ref="totalSpace" style="height: 100%;">
        {{ errorPrompt }}
        <v-row ref="row1Space" class="ml-1 mr-1 mt-4">
            <v-col>
                <v-text-field v-if="proposalWithDoc" v-model="proposalWithDoc.proposal.course_name" variant="outlined"
                    label="课程名称" density="compact" persistent-hint :hint="proposalWithDoc.oriDoc.course_name" />
            </v-col>
            <v-col>
                <v-alert v-if="proposalWithDoc && proposalWithDoc.proposal.del_id" type="warning" variant="outlined"
                    density="compact">
                    用户想要删除这份文档
                </v-alert>
                <v-alert v-if="proposalWithDoc && proposalWithDoc.oriDoc.major_id == 0" type="info" variant="outlined"
                    density="compact">
                    用户新建了这份文档
                </v-alert>
                <v-alert
                    v-else-if="proposalWithDoc && (proposalWithDoc.oriDoc.link == null) != (proposalWithDoc.proposal.link == null)"
                    type="warning" variant="outlined" density="compact">
                    用户切换了文档类型（独立文档/引用其它文档）。
                </v-alert>


            </v-col>
        </v-row>
        <v-form v-if="proposalWithDoc" v-model="infoValid">
            <v-row ref="row2Space" class="ml-1 mr-1 ">
                <v-col>
                    <v-number-input v-model="proposalWithDoc.proposal.credit" :precision="1" :step="0.5"
                        control-variant="split" label="学分" :hide-input="false" :inset="false" variant="outlined"
                        density="compact" perisistent-hint :hint="String(proposalWithDoc.oriDoc.credit)"
                        persistent-hint />
                </v-col>

                <v-col>
                    <v-combobox v-model="proposalWithDoc.proposal.class" :items="classNames" variant="outlined"
                        :hint="proposalWithDoc.oriDoc.class" density="compact" label="类型" persistent-hint />
                </v-col>

                <v-col>
                    <v-combobox v-model="grade" :items="gradeName" variant="outlined" density="compact" label="年级"
                        :rules="[checkGrade]" :hint="gradeName[proposalWithDoc.oriDoc.grade]" persistent-hint />
                </v-col>

                <v-col>
                    <v-text-field v-model="proposalWithDoc.proposal.direction" variant="outlined" label="专业方向"
                        density="compact" :hint="proposalWithDoc.oriDoc.direction" persistent-hint />
                </v-col>
            </v-row>
        </v-form>
        <v-row v-if="proposalWithDoc && !proposalWithDoc.proposal.link && !proposalWithDoc.proposal.del_id"
            justify="center" class="ml-1 mr-1">
            <v-col>
                <v-card class="flex-grow-1">
                    <v-tabs v-model="tab" bg-color="primary" density="compact">
                        <v-tab value="editor">编辑</v-tab>
                        <v-tab value="preview">预览</v-tab>
                    </v-tabs>
                    <v-card-text>
                        <v-tabs-window v-model="tab">
                            <v-tabs-window-item value="editor">
                                <MonacoDiffEditor v-model="proposalWithDoc.proposal.doc_str"
                                    :original="proposalWithDoc.oriDoc.doc_str" :style="`height: ${editorHeight}px`"
                                    lang="markdown" />
                            </v-tabs-window-item>

                            <v-tabs-window-item value="preview" class="overflow-x-auto"
                                :style="`height: ${editorHeight}px`">
                                <MDC :value="proposalWithDoc.proposal.doc_str" />
                            </v-tabs-window-item>

                        </v-tabs-window>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-row v-if="proposalWithDoc && proposalWithDoc.proposal.link && !proposalWithDoc.proposal.del_id"
            justify="center" class="ml-1 mr-1">
            <button v-if="proposalWithDoc.oriDoc.link"
                :to="`/docs/${proposalWithDoc.oriDoc.link.major_id}/${proposalWithDoc.oriDoc.link.course_id}`">
                查看原先指向的页面
            </button>
            <button class="ml-2"
                :to="`/docs/${proposalWithDoc.proposal.link.major_id}/${proposalWithDoc.proposal.link.course_id}`">
                查看更新后指向的页面
            </button>
        </v-row>
        <v-row v-if="proposalWithDoc && proposalWithDoc.proposal.del_id">
            <button class="ma-2"
                :to="`/docs/${proposalWithDoc.proposal.major_id}/${proposalWithDoc.proposal.course_id}`">
                查看要删除的页面
            </button>
        </v-row>

        <v-row v-if="proposalWithDoc && !proposalWithDoc.proposal.link" ref="row3Space" class="ml-4 mr-4 mt-4">
            <v-combobox v-model="proposalWithDoc.proposal.teachers" chips multiple variant="outlined" density="compact"
                label="任课教师" :hint="JSON.stringify(proposalWithDoc.oriDoc.teachers)" persistent-hint />
        </v-row>
        <v-row class="ml-4 mr-4" justify="end">
            <v-col>
                <v-text-field v-model="reason" label="拒绝理由" hide-details density="compact" variant="underlined" />
            </v-col>
            <v-col>
                <v-btn color="error" block variant="tonal" @click="submit(reason)">拒绝</v-btn>
            </v-col>
            <v-spacer />
            <v-col>
                <v-btn color="success" block variant="tonal" @click="submit(true)">同意</v-btn>
            </v-col>
        </v-row>
        <v-navigation-drawer location="right">
            <v-list line="two">
                <v-list-subheader>新增附件</v-list-subheader>
                <v-list-item v-for="(a, index) in newAttachments" :key="index" :title="a.name" :subtitle="a.timestamp">
                    <template #append>
                        <v-btn icon="mdi-content-copy" variant="text" density="compact"
                            @click="toClipboard(`/api/files/${a.file_id}`)" />
                        <v-btn icon="mdi-download" variant="text" density="compact" :href="`/api/files/${a.file_id}`" />
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
import useClipboard from "vue-clipboard3";

const route = useRoute();
const { toClipboard } = useClipboard();

/**
 * 文档更新申请编号
 */
const proposalId = route.params.id;


const tab = ref<"preview" | "editor">("editor");

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
 * 更新的内容是否合法
 */
const infoValid = ref(false);

/**
 * 用户填写的年级
 * @note 需要转换成对应年级编号才可使用
 */
const grade = ref("");

const requestFetch = useRequestFetch();

/**
 * 获得申请内容和原来的文档
 */
const { data: proposalWithDoc, error } = await useAsyncData(`major-review-${proposalId}`, () =>
    requestFetch<{ proposal: CourseWithDbId, oriDoc: Course }>("/api/courses/proposal-with-doc", {
        method: "GET",
        query: {
            review_id: proposalId,
        }
    }).then((res) => {
        grade.value = gradeName[res.proposal.grade];
        return res;
    })
);

if (error.value) {
    throw showError({ statusCode: error.value.statusCode, statusMessage: (error.value.data as { message: string }).message as string });
}

const checkGrade = (s: string) => {
    if (gradeName.findIndex(v => v == s) != -1)
        return true;
    return "请选择具体学期或选择概述";
};

const successSnakebar = ref(false);
const errorSnakebar = ref(false);
const errorPrompt = ref("");

const { data: newAttachments } = useAsyncData(`proposal-new-attach-${proposalId}`, () =>
    requestFetch<AttachmentInfo[]>("/api/files/with-proposal", {
        method: "GET",
        query: {
            proposal_id: proposalId,
        }
    })
)


// 将选择的 grade 转换成对应编号。
watch(grade, () => {
    const index = gradeName.findIndex(s => s == grade.value);
    if (index != -1 && proposalWithDoc.value)
        proposalWithDoc.value.proposal.grade = index;
});

const reason = ref("");

const submit = (accept: string | true) => {
    if (!proposalWithDoc.value) {
        errorPrompt.value = "提交失败";
        errorSnakebar.value = true;
        return;
    }

    if (proposalWithDoc.value?.proposal.del_id) {
        $fetch("/api/courses/apply-del", {
            method: "POST",
            body: {
                id: proposalWithDoc.value.proposal.del_id,
                proposal_id: proposalWithDoc.value.proposal._id,
                accept,
            }
        }).then(() => {
            successSnakebar.value = true;
            navigateTo("/review/docs");
        }).catch((err) => {
            errorPrompt.value = err.data.message;
            errorSnakebar.value = true;
        });
    } else {
        const data = proposalWithDoc.value.proposal;
        $fetch("/api/courses/apply-update", {
            method: "POST",
            body: {
                major_id: data.major_id,
                grade: data.grade,
                course_name: data.course_name,
                direction: data.direction,
                doc_str: data.doc_str,
                course_id: data.course_id,
                teachers: data.teachers,
                link: data.link,
                credit: data.credit,
                class: data.class,
                proposal_id: data._id,
                accept,
            }
        }).then(() => {
            successSnakebar.value = true;
            navigateTo("/review/docs");
        }).catch((err) => {
            errorPrompt.value = err.data.message;
            errorSnakebar.value = true;
        });
    }
}
</script>