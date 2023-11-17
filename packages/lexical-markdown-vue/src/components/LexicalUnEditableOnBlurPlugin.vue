<script setup lang="ts">

import {useEditor, useMounted} from "lexical-vue";
const editor = useEditor()

const onSelectionChange = () => {
  // if range not exist in editor rootElement, then make editor uneditable
  const selection = window.getSelection()
  if (selection && !editor.getRootElement()?.contains(selection.anchorNode)) {
    editor.setEditable(false)
  }
}

const onBlur = () => {
  editor.setEditable(false)
}

useMounted(() => {
  const editorDOM = editor.getRootElement()
  window.addEventListener('blur', onBlur)
  // editorDOM && editorDOM.addEventListener('blur', onBlur)
  // window.addEventListener('selectionchange', onSelectionChange)
  return () => {
    // window.removeEventListener('selectionchange', onSelectionChange)
    // editorDOM && editorDOM.removeEventListener('blur', onBlur)
    window.removeEventListener('blur', onBlur)
  }
})

</script>

<template>

</template>

<style scoped>

</style>