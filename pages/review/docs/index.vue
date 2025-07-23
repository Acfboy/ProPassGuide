<template>
    <div>
        <v-row justify="center" class="mt-4 ma-4 ma-md-0">
            <v-table>
                <thead>
                    <tr>
                        <th>
                            学院
                        </th>
                        <th>
                            专业
                        </th>
                        <th>
                            课程
                        </th>
                        <th>
                            申请时间
                        </th>
                        <th>
                            操作
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item) in courseProposals" :key="item.proposal?.timestamp">
                        <td>{{ idToMajor.get(item.major_id)?.school }}</td>
                        <td>{{ idToMajor.get(item.major_id)?.name }}</td>
                        <td>{{ item.course_name }}</td>
                        <td>{{ item.proposal?.timestamp }}</td>
                        <td>
                            <v-btn variant="text" append-icon="mdi-open-in-new" @click="navigateTo(`/review/docs/${item._id}`)">审核</v-btn>
                        </td>
                    </tr>
                </tbody>
            </v-table>
        </v-row>


        <v-snackbar v-model="successSnakebar" :timeout="2000" color="success" variant="tonal">
            提交成功
        </v-snackbar>
        <v-snackbar v-model="errorSnakebar" :timeout="2000" color="error" variant="tonal">
            {{ errorPrompt }}
        </v-snackbar>
    </div>
</template>

<script setup lang="ts">
import type { CourseWithDbId } from '~/utils/types';

const requestFetch = useRequestFetch();

const { data: majorItems } = await useAsyncData("majors-review", () =>
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


const idToMajor = new Map<number, Major>();

watchEffect(() => {
    majorItems.value?.reduce((pre: Major[], cur) => pre.concat(cur[1]), []).forEach(m => idToMajor.set(m.major_id, m));
});


const { data: courseProposals } = useAsyncData(
    "course-proposals",
    () => requestFetch<CourseWithDbId[]>("/api/courses/proposals", { method: "GET" })
);

const successSnakebar = ref(false);
const errorSnakebar = ref(false);
const errorPrompt = ref("");

</script>