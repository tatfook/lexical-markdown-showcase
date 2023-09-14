<script setup lang="ts">

import {inject, onMounted} from "vue";
import {useEditor} from "lexical-vue";
import {$convertFromMarkdownString, $convertToMarkdownString} from "@lexical/markdown";
import type {Transformer} from "@lexical/markdown";
import {CLEAR_EDITOR_COMMAND} from "lexical";
import {isMessageType, MessageType} from "@/message.ts";

const props = defineProps<{
  transformers: Transformer[]
}>()

const editor = useEditor()

const sendMessage = (data: MessageType) => {
  if (isMessageType(data)
      && (data.type === 'init' || data.type === 'update')
      && data.source === 'parent'
  ) {
    const currentMarkdown = editor
        .getEditorState()
        .read(() => $convertToMarkdownString(props.transformers))
    if (currentMarkdown !== data.text) {
      const initialEditorState = () => $convertFromMarkdownString(data.text, props.transformers)
      editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined)
      editor.update(() => {
        initialEditorState()
      }, {
        tag: 'reload'
      })
    }
  } else {
    console.warn('message is not a MessageType', data)
  }
}

const listens = inject('listens')

onMounted(() => {
  // if there has a parent window, then send a message to parent window
  if (window.parent !== window) {
    const message: MessageType = {
      type: 'loaded',
      text: '',
      source: 'child'
    }
    // @ts-ignore
    listens.forEach(listen => listen(message))
  }
  // @ts-ignore
  window.sendMessage = sendMessage
})

</script>

<template>

</template>

<style scoped>

</style>