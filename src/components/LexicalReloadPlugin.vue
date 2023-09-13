<script setup lang="ts">

import {onMounted} from "vue";
import {useEditor} from "lexical-vue";
import {$convertFromMarkdownString} from "@lexical/markdown";
import {CLEAR_EDITOR_COMMAND} from "lexical";
import {isMessageType, MessageType} from "@/message.ts";

const props = defineProps<{
  transformers: Array<Transformer>
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
    if (isMessageType(data)
        && (data.type === 'init' || data.type === 'update')
        && data.source === 'parent'
    ) {
      // @ts-expect-error
      const initialEditorState = () => $convertFromMarkdownString(data.text, props.transformers!)
      editor.dispatchCommand(CLEAR_EDITOR_COMMAND, {
        tag: 'reload'
      })
      editor.update(() => {
        initialEditorState()
      }, {
        tag: 'reload'
      })
    } else {
      console.warn('message is not a MessageType', data)
    }
  })
})

</script>

<template>

</template>

<style scoped>

</style>