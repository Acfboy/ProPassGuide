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