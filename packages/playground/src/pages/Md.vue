<script setup lang="ts">
import { LexicalMarkdownVue } from 'lexical-markdown-vue'
import {useRoute} from "vue-router";
import {onMounted, provide, ref} from "vue";
import {$convertFromMarkdownString, $convertToMarkdownString} from "@lexical/markdown";
import {isMessageType, MessageType} from "@/message";

const route = useRoute()

const isDev = ref(route.query.is_dev !== 'false')
const isEditable = ref(route.query.is_editable !== 'false')
const id = ref(route.query.id as string)
import ExampleMd from '@/assets/example.md'
import {$getRoot, CLEAR_EDITOR_COMMAND} from "lexical";
import {exportNodeToJSON} from "lexical-markdown-vue/src/lexical-util";
import {CodeUpdate} from "lexical-markdown-vue";
const codeUpdate = ref<CodeUpdate>({
  code: ExampleMd,
  source: 'parent'
})
provide('id', id)


const onError = (error) => {
  console.error(error)
}

const onChange = (newCodeUpdate: CodeUpdate) => {
  const message: MessageType = {
    id: id.value,
    type: 'update',
    text: newCodeUpdate.code,
    source: 'child'
  }
  window.parent.postMessage(message, '*')
  codeUpdate.value = newCodeUpdate
}

onMounted(() => {
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
      codeUpdate.value = {
        code: data.text,
        source: 'parent'
      }
    }
  })
})
</script>

<template>
  <LexicalMarkdownVue
      @onChange="onChange"
      @onError="onError"
      :is-dev="isDev"
      :is-editable="isEditable"
      :code-update="codeUpdate"
  />
</template>

<style lang="scss">
@import 'github-markdown-css/github-markdown-light.css';
@import 'src/assets/style.css';

.markdown-body .editor-code{
  padding: 16px;
}
.markdown-body .editor-code br{
  display: block;
}
#app{
  background: #FFF;
}

.dropdown-menu {
  position: absolute;
  width: 240px;
  padding: 8px 0;
  border-radius: 8px;
  background-color: #f8f8f8;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.14);
  z-index: 3000;

  .dropdown-menu-item {
    height: 24px;
    font-size: 14px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    margin: 0 8px;
    padding: 8px 8px;
    gap: 12px;

    .dropdown-menu-item-subtitle {
      color: #858a90;
    }

    .img-boxing {
      width: 20px;
      height: 20px;
      background: #e9e9e9;
      border-radius: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    img {
      //width: 14px;
      //height: 14px;
    }

    &:hover {
      cursor: pointer;
    }

    &, * {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #666666
    }
  }

  .dropdown-menu-item-active {
    background: #e9e9e9;
  }
}
</style>