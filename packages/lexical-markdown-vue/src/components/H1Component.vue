<script setup lang="ts">
const props = defineProps<{
  markdown: string
}>()
</script>

<template>
  <h1>{{props.markdown}}</h1>
</template>

<style scoped>

</style>