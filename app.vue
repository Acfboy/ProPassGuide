<template>
  <v-app>
    <v-toolbar border color="white">
      <template #prepend>
        <v-icon class="ma-3" icon="mdi-school" />
      </template>
      <v-toolbar-title @click="navigateTo('/')">{{ config.public.siteTitle }}</v-toolbar-title>

    </v-toolbar>
    <NuxtPage />
  </v-app>
</template>

<script lang="ts" setup>
const config = useRuntimeConfig();
</script>

<style>
::-webkit-scrollbar {
  -webkit-appearance: none;
  width: 3px;
  height: 3px;
}

::-webkit-scrollbar-thumb {
  cursor: pointer;
  border-radius: 5px;
  background: rgba(0, 0, 0, 0.15);
  transition: color 0.2s ease;
}

</style>