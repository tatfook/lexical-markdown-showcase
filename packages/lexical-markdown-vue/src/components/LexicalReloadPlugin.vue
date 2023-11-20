<script setup lang="ts">

import {inject, onMounted, Ref, watch} from "vue";
import {useEditor} from "lexical-vue";
import {$convertFromMarkdownString} from "@lexical/markdown";
import type {Transformer} from "@lexical/markdown";
import {$getRoot, $setSelection, CLEAR_EDITOR_COMMAND} from "lexical";
import {exportNodeToJSON} from "@/lexical-util";

const props = defineProps<{
  transformers: Transformer[]
}>()

const editor = useEditor()
const id = inject<Ref<string>>('id')!
const code = inject<Ref<string>>('code')!
watch(code, () => {
  const initialEditorState = () => $convertFromMarkdownString(code.value, props.transformers!)
  editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined)
  editor.update(() => {
    initialEditorState()
    $setSelection(null)
  }, {
    tag: 'reload'
  })
})


</script>

<template>

</template>

<style scoped>

</style>