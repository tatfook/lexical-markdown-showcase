<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref, watchEffect} from "vue";

import ExampleMd from '@/assets/example.md'
import {isMessageType, MessageType} from "@/message";

const IFRAME_REF = ref<HTMLIFrameElement | null>()
const MARKDOWN_EDITOR_REF = ref<HTMLTextAreaElement | null>()

const markdown = ref(ExampleMd)

const onMessage = (event) => {
  const {data} = event
  if (!isMessageType(data)) {
    console.warn('message is not a MessageType', data)
    return
  }
  if (data.type === 'loaded'
      && data.source === 'child'
  ) {
    const postMessage = IFRAME_REF.value?.contentWindow?.postMessage
    const meesage: MessageType = {
      type: 'init',
      text: ExampleMd,
      source: 'parent'
    }
    postMessage && postMessage(meesage , '*')
  }
  if (data.type === 'update'
      && data.source === 'child'
  ) {
    console.log("data.text", data.text);
    markdown.value = data.text
  }
}

onMounted(() => {
  window.addEventListener('message', onMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', onMessage)
})

const onInput = () => {
  const postMessage = IFRAME_REF.value?.contentWindow?.postMessage
  const message: MessageType = {
    type: 'update',
    text: MARKDOWN_EDITOR_REF.value!.value,
    source: 'parent'
  }
  postMessage && postMessage(message, '*')
}

</script>

<template>
  <div class="container">
    <h1>Lexical Vue Markdown Demo</h1>
    <p>Note: this is an experimental build of Lexical</p>
    <div class="two-editor-container">
      <iframe ref="IFRAME_REF" src="./md?is_editable=false" frameborder="0" class="markdown-display"></iframe>
      <textarea class="markdown-editor" @input="onInput" contenteditable="true" ref="MARKDOWN_EDITOR_REF"
                v-model="markdown">
      </textarea>
    </div>
    <div class="other">
      <h2>View source</h2>
      <a
          href="https://github.com/tatfook/lexical-markdown-showcase"
          target="_blank"
          rel="noreferrer"
      >
        GitHub
      </a>
    </div>
  </div>
</template>

<style lang="scss">
.container{
  margin: 0 auto;
  margin-top: 60px;
  padding: 2rem;
  text-align: center;
}

.two-editor-container {
  margin: 0 auto;
  width: 80vw;
  display: flex;
  min-height: 600px;
}

.markdown-display{
  width: 50%;
  border: none;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.markdown-editor {
  overflow-y: auto;
  width: 50%;
  color: #333;
  background: #FFF;
  border: none;
  border-left: 1px solid #cccccc;
  text-align: left;
  padding: 10px;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  resize: none;

  &:focus {
    outline: none;
  }

  p {
    margin: 0 0 10px;
  }
}
</style>