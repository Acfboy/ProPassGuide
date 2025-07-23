<template>
  <v-container class="fill-height d-flex flex-column align-center pa-0" style="max-width:100vw;">
    <v-row justify="center" align="center" class="w-100 mt-2">
      <v-col cols="12" md="8" lg="6" class="text-center">
        <p class="text-h2 font-weight-bold mb-4 text-sm-h3">{{ runtimeConfig.public.siteTitle }}</p>
        <p class="text-disabled text-h6">{{ runtimeConfig.public.siteSubtitle }}</p>
        <div class="mt-4">
          <v-btn class="ma-4" variant="flat" size="large" color="primary" @click="navigateTo('/docs/0/0')">简介</v-btn>
          <v-btn class="ma-4" variant="outlined" size="large" color="primary" @click="navigateTo('/signup')">立即注册</v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig();
</script>
