<template>
    <p> {{  toRaw(router).currentRoute.value.fullPath }}</p>
</template>

<script setup lang="ts">
const router = useRouter()
</script>