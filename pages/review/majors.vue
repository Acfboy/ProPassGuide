<template>
    <div>
        <v-row justify="center" class="mt-4">
            <v-table>
                <thead>
                    <tr>
                        <th>
                            专业名
                        </th>
                        <th>
                            学院
                        </th>
                        <th>
                            申请操作
                        </th>
                        <th>
                            原因
                        </th>
                        <th>
                            申请时间
                        </th>
                        <th>
                            操作
                        </th>
                        <th>
                            拒绝理由
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in majorProposals" :key="item.proposal?.timestamp">
                        <td>{{ item.name }}</td>
                        <td>{{ item.school }}</td>
                        <td>{{ ("del_id" in item) ? "删除" : "增加" }}</td>
                        <td>{{ item.proposal?.reason }}</td>
                        <td>{{ item.proposal?.timestamp }}</td>
                        <td>
                            <v-btn icon="mdi-check" density="compact" color="success" class="mr-1"
                                @click="operateProposal(index, true)" />
                            <v-btn icon="mdi-close" density="compact" color="error"
                                @click="operateProposal(index, false)" />
                        </td>
                        <td>
                            <v-text-field v-model="item.proposal!.accept" density="compact" variant="underlined"
                                hide-details width="15em" />
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
const requestFetch = useRequestFetch();

const { data: majorProposals } = useAsyncData(
    "major-proposals",
    () => requestFetch<MajorProposal[]>("/api/majors/proposals", { method: "GET" }).then(res => {
        res.forEach(m => {
            if (m.proposal)
                m.proposal.accept = "";
        });
        return res;
    })
);

const successSnakebar = ref(false);
const errorSnakebar = ref(false);
const errorPrompt = ref("");

const operateProposal = async (index: number, accept: boolean) => {
    const cur = majorProposals.value?.at(index);
    if (cur?.del_id) {
        await $fetch("/api/majors/apply-del", {
            method: "POST",
            body: {
                id: cur.del_id,
                proposal_id: cur._id,
                accept,
                reason: cur.proposal?.accept,
            }
        })
            .then(() => {
                successSnakebar.value = true;
            })
            .catch((err) => {
                errorPrompt.value = err.data.message;
                errorSnakebar.value = true;
            })

    }
    else if (cur) {
        await $fetch("/api/majors/apply-add", {
            method: "POST",
            body: {
                proposal_id: cur._id,
                accept,
                reason: cur.proposal?.accept,
            }
        })
            .then(() => {
                successSnakebar.value = true;
            })
            .catch((err) => {
                errorPrompt.value = err.data.message;
                errorSnakebar.value = true;
            })

    }

    majorProposals.value?.splice(index, 1);
}
</script>