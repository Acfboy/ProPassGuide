<template>
    <v-main>
        <v-row justify="center">
            <!-- 111 -->
            <!-- <v-card class="ma-8" width="80vw" min-height="80vh">
                <v-card-title>
                    {{ (user as { name: string }).name }}
                </v-card-title>
            </v-card> -->
            <v-card class="ma-8" width="50vw" min-height="80vh">
                <v-card-item :title="(user as { name: string }).name">
                    <template v-if="(user as { admin: boolean }).admin" #subtitle>
                        <v-icon class="me-1 pb-1" color="info" icon="mdi-account-cog" size="18"/>
                        管理员
                    </template>
                </v-card-item>

                <v-card-text v-if="data">
                    <v-row class="ma-2">
                        <v-col class=" text-center">
                            <p class="text-h2"> {{ data.doc.length + data.major.length }}</p>

                            <p class="text-center text-disabled mt-2" color="success"><v-icon
                                    class="mr-2">mdi-file-outline</v-icon>提交申请
                            </p>
                        </v-col>
                        <v-col class=" text-center">
                            <p class="text-h2"> {{data.doc.filter(c => c.proposal?.accept === true).length +
                                data.major.filter(c => c.proposal?.accept === true).length}}</p>

                            <p class="text-center text-disabled mt-2" color="success"><v-icon
                                    class="mr-2">mdi-check-all</v-icon>通过申请
                            </p>
                        </v-col>
                        <v-col class=" text-center">
                            <p class="text-h2"> {{data.doc.filter(c => (typeof c.proposal?.accept) === "string").length
                                +
                                data.major.filter(c => (typeof c.proposal?.accept) === "string").length}}</p>
                            <p class="text-center text-disabled mt-2" color="success"><v-icon
                                    class="mr-2">mdi-close</v-icon>被拒绝
                            </p>
                        </v-col>
                        <v-col class=" text-center">
                            <p class="text-h2"> {{data.doc.filter(c => c.proposal?.accept === false).length +
                                data.major.filter(c => c.proposal?.accept === false).length}}</p>
                            <p class="text-center text-disabled mt-2" color="success"><v-icon
                                    class="mr-2">mdi-loading</v-icon>待审核
                            </p>
                        </v-col>
                    </v-row>


                </v-card-text>
                <v-divider/>
                <v-card-text>

                    <v-data-table :items="tableItems">
                        <template #item.状态="{ value }">
                            <v-icon v-if="value === true" color="success">mdi-check</v-icon>
                            <v-icon v-else-if="value === false" color="info">mdi-loading</v-icon>
                            <v-icon v-else color="error">mdi-close</v-icon>
                        </template>
                    </v-data-table>
                </v-card-text>

            </v-card>
        </v-row>
    </v-main>
</template>

<script setup lang="ts">
const { user } = useUserSession();

const requestFetch = useRequestFetch();

const { data } = useAsyncData(() =>
    requestFetch<{ doc: Course[], major: MajorProposal[] }>("/api/contribution")
)

const tableItems = computed(() => {
    if (!data.value) return;
    const res: ({ "操作": string, "修改对象": string, "状态": boolean | undefined | string, "审核消息": string, "时间": string, })[] = [];
    data.value.doc.forEach(c => {
        let status = "";
        if (c.proposal?.accept === true)
            status = "感谢您的贡献！";
        else if (c.proposal?.accept === false)
            status = "等待审核";
        else if (typeof c.proposal?.accept == "string")
            status = c.proposal?.accept;
        res.push({
            "操作": c.del_id ? "删除课程" : "修改/新建课程",
            "修改对象": `${c.course_name} 课程`,
            "状态": c.proposal?.accept,
            "审核消息": status,
            "时间": c.proposal?.timestamp ?? "",
        })
    });

    data.value.major.forEach(c => {
        let status = "";
        if (c.proposal?.accept === true)
            status = "感谢您的贡献！";
        else if (c.proposal?.accept === false)
            status = "等待审核";
        else if (typeof c.proposal?.accept == "string")
            status = c.proposal?.accept;
        res.push({
            "操作": c.del_id ? "删除专业" : "新建专业",
            "修改对象": `${c.school} - ${c.name} 专业`,
            "状态": c.proposal?.accept,
            "审核消息": status,
            "时间": c.proposal?.timestamp ?? "",
        })
    });

    res.sort((a, b) => {
        const dateA = new Date(a.时间);
        const dateB = new Date(b.时间);
        return - Number(dateA) + Number(dateB); // 升序
        // 或降序：dateB - dateA
    });

    return res;
});
</script>