<script setup lang="ts">
import {onMounted, onUnmounted, ref} from "vue";

import ExampleMd from '@/assets/example.md'
import {isMessageType, MessageType} from "@/message.ts";

const IFRAME_REF = ref<HTMLIFrameElement | null>()
const MARKDOWN_EDITOR_REF = ref<HTMLDivElement | null>()

const markdown = ref(ExampleMd)

const init = () => {
  // @ts-ignore
  const sendMessage = IFRAME_REF.value?.contentWindow?.sendMessage
  const meesage: MessageType = {
    type: 'init',
    text: ExampleMd,
    source: 'parent'
  }
  sendMessage && sendMessage(meesage)
}

const onMessage = (data) => {
  if (!isMessageType(data)) {
    console.warn('message is not a MessageType', data)
    return
  }
  if (data.type === 'loaded'
      && data.source === 'child'
  ) {
    init()
  }
  if (data.type === 'update'
      && data.source === 'child'
  ) {
    console.log("data.text", data.text);
    markdown.value = data.text
  }
}

onMounted(() => {
  setTimeout(() => {
    // @ts-ignore
    IFRAME_REF.value?.contentWindow.onListenMessage(onMessage)
    init()
  }, 2000)

})

onUnmounted(() => {
})

const onInput = () => {
  // @ts-ignore
  const sendMessage = IFRAME_REF.value?.contentWindow?.sendMessage
  const message = {
    type: 'update',
    text: MARKDOWN_EDITOR_REF.value!.innerText,
    source: 'parent'
  }
  sendMessage && sendMessage(message, '*')
}

</script>

<template>
  <div class="container">
    <h1>Lexical Vue Markdown Demo</h1>
    <p>Note: this is an experimental build of Lexical</p>
    <div class="two-editor-container">
      <iframe ref="IFRAME_REF" src="./md" frameborder="0" class="markdown-display"></iframe>
      <div class="markdown-editor" @input="onInput" contenteditable="true" ref="MARKDOWN_EDITOR_REF">
        <p v-for="(md, index) in markdown.split('\n')" :key="index">
          <span v-if="md !== ''">{{ md }}</span>
          <br v-else/>
        </p>
      </div>
    </div>
    <div class="other">
      <h2>View source</h2>
      <ul>
        <li>
          <a
              href="https://github.com/tatfook/lexical-markdown-showcase"
              target="_blank"
              rel="noreferrer"
          >
            GitHub
          </a>
        </li>
      </ul>
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
  height: 600px;
}

.markdown-display{
  width: 50%;
  height: 100%;
  border: none;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.markdown-editor {
  overflow-y: auto;
  width: 50%;
  background: #FFF;
  border-left: 1px solid #cccccc;
  text-align: left;
  padding: 10px;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;

  &:focus {
    outline: none;
  }

  p {
    margin: 0 0 10px;
  }
}
</style>