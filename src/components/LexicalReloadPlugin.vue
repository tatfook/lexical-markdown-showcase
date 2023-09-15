<script setup lang="ts">

import {onMounted} from "vue";
import {useEditor} from "lexical-vue";
import {$convertFromMarkdownString, $convertToMarkdownString} from "@lexical/markdown";
import type {Transformer} from "@lexical/markdown";
import {CLEAR_EDITOR_COMMAND} from "lexical";
import {isMessageType, MessageType} from "@/message";

const props = defineProps<{
  transformers: Transformer[]
}>()

const editor = useEditor()

onMounted(() => {
  // if there has a parent window, then send a message to parent window
  if (window.parent !== window) {
    const message: MessageType = {
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
    ) {
      const currentMarkdown = editor
          .getEditorState()
          .read(() => $convertToMarkdownString(props.transformers))
      if (currentMarkdown !== data.text) {
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