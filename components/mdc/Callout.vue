<template>
    <div class="mt-4 mb-4">
        <v-alert :type="props.type" 
            :border="props.border" 
            :variant="props.variant ?? 'tonal'" 
            :title="props.title"
            :border-color="props.borderColor"
            :icon="props.icon"
            :color="props.color"
        >
            <MDCSlot />
        </v-alert>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    title: string | undefined,
    variant: "elevated" | "flat" | "tonal" | "outlined" | "text" | "plain" | undefined,
    type: "error" | "info" | "warning" | "success" | undefined,
    border: "start" | "end" | "top" | "bottom" | undefined,
    borderColor: string | undefined,
    color: string | undefined,
    icon: string | undefined
}>()
</script>