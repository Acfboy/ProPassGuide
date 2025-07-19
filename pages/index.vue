<template>
  <v-container class="fill-height d-flex flex-column align-center pa-0" style="max-width:100vw;">
    <v-row justify="center" align="center" class="w-100 mt-2">
      <v-col cols="12" md="8" lg="6" class="text-center">
        <h1 class="display-1 font-weight-bold mb-4">{{runtimeConfig.public.siteTitle}}</h1>
        <h2 class="subtitle-1 mb-8">ProPassGuide 这个项目目标是实现一个工具，可以方便地编辑和发布“专业通关指南”。<br>即实现一个文档工具，可以查看对专业培养计划中每一门课的介绍、相关资料、选课评价，登录后可以发布评价和编辑相关指南。</h2>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig();
</script>

<style scoped>
.display-1 {
  font-size: 2.8rem;
  font-weight: bold;
  margin-top: 2rem;
}
.subtitle-1 {
  font-size: 1.2rem;
  color: #333;
  line-height: 2.2;
  white-space: pre-line;
}
</style>