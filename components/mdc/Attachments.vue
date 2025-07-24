<template>
    <v-expansion-panels v-if="attachs" :elevation="1" class="mt-2 mb-2" prepend-icon="mdi-paperclip">
        <v-expansion-panel prepend-icon="mdi-paperclip">
            <v-expansion-panel-title>
                <!-- <v-icon>mdi-paperclip</v-icon> -->
                附件
            </v-expansion-panel-title>
            <v-expansion-panel-text>
                <v-list density="compact">
                    <v-list-item v-for="a in attachs" :key="a.timestamp" density="compact"
                        :href="`/api/files/${a.file_id}`" :title="a.name" :subtitle="a.timestamp"
                        append-icon="mdi-paperclip" />
                </v-list>
            </v-expansion-panel-text>
        </v-expansion-panel>
    </v-expansion-panels>
</template>

<script setup lang="ts">
const route = useRoute();
const majorId = route.params.major;
const docId = route.params.doc;
const requestFetch = useRequestFetch();

const { data: attachs } = useAsyncData(`attachments-${majorId}-${docId}-doc`, () =>
    requestFetch<AttachmentInfo[]>("/api/files/with-doc", {
        method: "GET",
        query: {
            major_id: majorId,
            course_id: docId
        }
    })
);

</script>