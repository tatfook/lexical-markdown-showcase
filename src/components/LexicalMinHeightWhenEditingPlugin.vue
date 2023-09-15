<script setup lang="ts">

import {ref} from "vue";
import {useRoute} from "vue-router";
import {useEditor, useMounted} from "lexical-vue";

const route = useRoute()
const editor = useEditor()

const editableMinHeight = ref(150)
try {
  editableMinHeight.value = parseInt(route.query.editable_min_height as string)
} catch (e) {
  console.error(e)
}

useMounted(() => {
  const rootElement = editor.getRootElement()
  return editor.registerEditableListener((editable) => {
    if (!rootElement) return
    if (editable) {
      rootElement.style.minHeight = `${editableMinHeight.value}px`
    } else{
      rootElement.style.minHeight = ''
    }
  })
})

</script>

<template>

</template>

<style scoped>

</style>