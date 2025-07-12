<template>
  <v-app>
    <v-empty-state :headline="`Whoops, ${error.statusCode}`" :title="error.message"/>
  </v-app>
</template>

<script>
export default {
  props: {
    error: {
      type: Object,
      required: true
    }
  },
}
</script>