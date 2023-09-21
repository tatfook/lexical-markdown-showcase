<script setup lang="ts">

import {inject, onMounted, Ref} from "vue";
import {useEditor} from "lexical-vue";
import {$convertFromMarkdownString} from "@lexical/markdown";
import type {Transformer} from "@lexical/markdown";
import {CLEAR_EDITOR_COMMAND} from "lexical";
import {isMessageType, MessageType} from "@/message";

const props = defineProps<{
  transformers: Transformer[]
}>()

const editor = useEditor()
const id = inject<Ref<string>>('id')!


onMounted(() => {
  // if there has a parent window, then send a message to parent window
  if (window.parent !== window) {
    const message: MessageType = {
      id: id.value,
      type: 'loaded',
      text: '',
      source: 'child'
    }
    window.parent.postMessage(message)
  }
  window.addEventListener('message', (event) => {
    const {data} = event
    if (!isMessageType(data)) {
      console.warn('message is not a MessageType', data)
      return
    }
    if ((data.type === 'init' || data.type === 'update')
        && data.source === 'parent'
        && data.id === id.value
    ) {
      const selection = window.getSelection()
      if (selection?.rangeCount === 0) {
        // current is not focus
        const initialEditorState = () => $convertFromMarkdownString(data.text, props.transformers!)
        editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined)
        editor.update(() => {
          initialEditorState()
        }, {
          tag: 'reload'
        })
      }
    }
  })
})

</script>

<template>

</template>

<style scoped>

</style>