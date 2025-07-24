<template>
    <v-main>
        <v-btn v-if="$route.params.major && props.sidebar" icon="mdi-swap-horizontal" class="d-md-none position-fixed right-0" style="z-index: 1000;" @click="swap = !swap" />
        <v-navigation-drawer mobile-breakpoint="sm" :model-value="!$vuetify.display.mobile || (props.sidebar && !swap)" persistent>
            <v-list>
                <v-list-group v-for="[school, majors] in listItems" :key="school" :value="school">
                    <!-- eslint-disable-next-line vue/no-template-shadow -->
                    <template #activator="{ props }">
                        <v-list-item v-bind="props" :title="school" />
                    </template>
                    <v-list-item v-for="major in majors" :key="major.major_id" :title="major.name"
                        :active="major.major_id == Number($route.params.major)"
                        @click="navigateTo(`/edit/${major.major_id}`)" />
                </v-list-group>
            </v-list>
        </v-navigation-drawer>
        <NuxtPage :majors="majorList" :sidebar="props.sidebar" :sidebar-swap="swap" />
        <div v-if="$route.params.major == undefined" class="ma-4">
            <v-breadcrumbs :items="['编辑专业']" />
            <v-row justify="center">
                <v-col cols="12" md="6" lg="4" xl="4">
                    <v-card title="申请添加专业" variant="outlined">
                        <v-card-text>
                            <v-form v-model="validAdd">
                                <v-row>
                                    <v-col>
                                        <v-combobox v-model="add.school" label="学院名" variant="underlined"
                                            density="compact" :items="listItems?.map((v) => v[0])" />
                                    </v-col>
                                    <v-col><v-text-field v-model="add.major" label="专业名" variant="underlined"
                                            density="compact" /></v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-text-field v-model="add.reason" label="添加理由" variant="underlined"
                                            density="compact" />
                                    </v-col>
                                </v-row>
                            </v-form>
                        </v-card-text>
                        <v-card-actions class="justify-center">
                            <v-btn color="primary" :disabled="!validAdd" @click="submitAdd">
                                提交申请
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
            <v-row justify="center">
                <v-col cols="12" md="6" lg="4" xl="4">
                    <v-card title="申请删除专业" variant="outlined">
                        <v-card-text>
                            <v-form v-model="validDel">
                                <v-row>
                                    <v-col>
                                        <v-combobox v-model="del.school" label="学院名" variant="underlined"
                                            density="compact" :rules="[checkSchoolName]"
                                            :items="listItems?.map((v) => v[0])" />
                                    </v-col>
                                    <v-col>
                                        <v-combobox v-model="del.major" label="专业名" variant="underlined"
                                            density="compact" :rules="[checkMajor]" :items="majorNames" />
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-text-field v-model="del.reason" label="删除理由" variant="underlined"
                                            density="compact" />
                                    </v-col>
                                </v-row>
                            </v-form>
                        </v-card-text>
                        <v-card-actions class="justify-center">
                            <v-btn color="primary" :disabled="!validDel" @click="submitDel()">
                                提交申请
                            </v-btn>
                        </v-card-actions>
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
    </v-main>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['auth']
});

const props = defineProps<{ sidebar: boolean }>();

const swap = ref(true);

const requestFetch = useRequestFetch();

const validAdd = ref(false);
const validDel = ref(false);
const del = ref({ school: "", major: "", reason: "" });
const add = ref({ school: "", major: "", reason: "" });

const successSnakebar = ref(false);
const errorSnakebar = ref(false);
const errorPrompt = ref("");

const submitAdd = () => {
    $fetch("/api/majors/propose-add", {
        method: "POST",
        body: add.value
    }).then(() => {
        successSnakebar.value = true;
    }).catch((err) => {
        errorPrompt.value = err.data.message;
        errorSnakebar.value = true;
    });
};

const submitDel = () => {
    $fetch("/api/majors/propose-del", {
        method: "POST",
        body: del.value
    }).then(() => {
        successSnakebar.value = true;
    }).catch((err) => {
        errorPrompt.value = `${err.statusCode}: ${err.data.message}`;
        errorSnakebar.value = true;
    });
};

/**
 * 选择申请删除专业时获得当前学院的专业。
 */
const majorNames = computed(() => {
    if (del.value.school.length == 0)
        return [];
    const schoolAndMajors = listItems.value?.find((v) => v[0] == del.value.school);
    if (schoolAndMajors) {
        return schoolAndMajors[1].map(v => v.name);
    }
    return [];
});

const checkMajor = (v: string) => {
    if (majorNames.value.find(s => s == v))
        return true;
    return "没有这个专业";
}

const checkSchoolName = (v: string) => {
    if (listItems.value?.findLast((item) => item[0] == v))
        return true;
    else
        return "没有这个学院";
}

/**
 * 所有专业信息组成的总列表
 */
const majorList = computed(() => {
    if (listItems.value) {
        return listItems.value.map((v) => v[1]).flat();
    }
    return [];
});

/**
 * 获得各个学院下的专业
 */
const { data: listItems } = await useAsyncData("majors-edit", () =>
    requestFetch<Major[]>("/api/majors", {
        method: "GET",
        query: {
            accepted: true
        }
    }).then((res) => {
        const schoolMajors = new Map<string, Major[]>();
        res.forEach((major) => {
            if (!(schoolMajors.has(major.school)))
                schoolMajors.set(major.school, [major]);
            else
                schoolMajors.get(major.school)?.push(major);
        });
        return schoolMajors.entries().toArray();
    })
)


</script>