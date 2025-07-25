<template>
    <v-list :elevation="3" class="ma-2">
        <v-list-group v-if="attachs">
            <!-- eslint-disable-next-line vue/no-template-shadow -->
            <template #activator="{ props }">
                <v-list-item density="compact" v-bind="props" title="附件" prepend-icon="mdi-paperclip" />
            </template>
            <div v-if="!notSupport">
                <v-list-item v-for="a in attachs" v-show="!props.fileIds || idList.find(f => f == a.file_id)"
                    :key="a.timestamp" density="compact" :href="`/api/files/${a.file_id}`" :title="a.name"
                    :subtitle="a.timestamp" append-icon="mdi-download" />
            </div>
            <v-list-item v-else>
                附件列表等待审核。
            </v-list-item>
        </v-list-group>
    </v-list>
    <!-- </v-card> -->
</template>

<script setup lang="ts">
const route = useRoute();
const majorId = route.params.major;
const docId = route.params.doc;
const requestFetch = useRequestFetch();

const props = defineProps<{ fileIds: string | undefined }>();
const notSupport = !docId || !majorId;

const idList = computed<string[]>(() => JSON.parse(props.fileIds?.replaceAll(`'`, `"`) ?? ""));

const { data: attachs } = useAsyncData(`attachments-${majorId}-${docId}-doc`, () =>
    notSupport ? (Promise.resolve([])) : requestFetch<AttachmentInfo[]>("/api/files/with-doc", {
        method: "GET",
        query: {
            major_id: majorId,
            course_id: docId
        }
    })
);

</script>