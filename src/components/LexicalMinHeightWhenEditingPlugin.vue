<script setup lang="ts">

import {ref} from "vue";
import {useRoute} from "vue-router";
import {useEditor, useMounted} from "lexical-vue";

const route = useRoute()
const editor = useEditor()

const isEditable = ref(route.query.is_editable !== 'false')

const editableMinHeight = ref<undefined | number>(undefined)
try {
  if (route.query.editable_min_height) {
    editableMinHeight.value = parseInt(route.query.editable_min_height as string)
  }
} catch (e) {
  console.error(e)
}



useMounted(() => {
  if (editableMinHeight.value) {
    const onEditableChanged = (editable) => {
      const rootElement = editor.getRootElement()
      if (!rootElement) return
      if (editable) {
        rootElement.style.minHeight = `${editableMinHeight.value}px`
      } else {
        rootElement.style.minHeight = 'unset'
      }
    }
    onEditableChanged(isEditable.value)
    return editor.registerEditableListener(onEditableChanged)
  }
})

</script>

<template>

</template>

<style scoped>

</style>