<script setup lang="ts">
import {
  LexicalComposer,
  LexicalRichTextPlugin,
  LexicalContentEditable,
  LexicalAutoFocusPlugin,
  LexicalAutoLinkPlugin,
  LexicalMarkdownShortcutPlugin,
  LexicalTreeViewPlugin,
  LexicalHistoryPlugin,
  LexicalListPlugin,
  LexicalCheckListPlugin,
  LexicalTabIndentationPlugin,
} from 'lexical-vue'
import {HashtagNode} from "@lexical/hashtag";
import {AutoLinkNode, LinkNode} from "@lexical/link";
import {TableCellNode, TableNode, TableRowNode} from "@lexical/table";
import {CodeHighlightNode, CodeNode} from "@lexical/code";
import {HeadingNode, QuoteNode} from "@lexical/rich-text";
import {ListItemNode, ListNode} from "@lexical/list";
import LexicalReloadPlugin from "@/components/LexicalReloadPlugin.vue";
import {EMOJI, EmojiNode} from "@/nodes/emoji.ts";
import {$convertToMarkdownString, TRANSFORMERS} from "@lexical/markdown";
import type {Transformer} from "@lexical/markdown";
import {IMAGE, ImageNode} from "@/nodes/image.ts";
import LexicalOnChangePlugin from '@/components/LexicalOnChangePlugin.vue'
import {MessageType} from "@/message.ts";
import {DIVIDER, DividerNode} from "@/nodes/divider.ts";
import {onBeforeMount, onMounted, provide, ref} from "vue";
import {useRoute} from "vue-router";

const route = useRoute()

console.log("route.query.is_dev", route.query.is_dev);
const isDev = ref(route.query.is_dev !== 'false')

const config = {
  editable: true,
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
    HashtagNode,
    EmojiNode,
    ImageNode,
    DividerNode,
  ],
}
const onError = (error) => {
  console.error(error)
}

const T: Transformer[] = [DIVIDER, IMAGE, EMOJI, ...TRANSFORMERS]

const URL_MATCHER = /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

const EMAIL_MATCHER = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/

const MATCHERS = [
  (text) => {
    const match = URL_MATCHER.exec(text)
    return (
        match && {
          index: match.index,
          length: match[0].length,
          text: match[0],
          url: match[0],
        }
    )
  },
  (text) => {
    const match = EMAIL_MATCHER.exec(text)
    return (
        match && {
          index: match.index,
          length: match[0].length,
          text: match[0],
          url: `mailto:${match[0]}`,
        }
    )
  },
]

const listens: ((msg: any) => void)[] = []
provide('listens', listens)

onBeforeMount(() => {
  console.log('onBeforeMount')
  // @ts-ignore
  window.onListenMessage = (listen) => {
    console.log('onListenMessage')
    listens.push(listen)
  }
})

const onChange = (editorState, editor, tags: Set<string>) => {
  if (tags.has('reload') || tags.has('history-merge')) {
    return
  }
  console.log("tags", tags);
  const markdown = editor
      .getEditorState()
      .read(() => $convertToMarkdownString(T))
  const message: MessageType = {
    type: 'update',
    text: markdown,
    source: 'child'
  }
  listens.forEach(listen => listen(message))
  console.log("markdown", markdown);
}
</script>

<template>
  <LexicalComposer :initialConfig="config" @error="onError">
    <div class="editor-container">
      <div class="editor-inner">
        <LexicalRichTextPlugin>
          <template #contentEditable>
            <LexicalContentEditable class="editor-input markdown-body"/>
          </template>
          <template #placeholder>
            <div class="editor-placeholder">
              Enter some text...
            </div>
          </template>
        </LexicalRichTextPlugin>
        <LexicalAutoFocusPlugin/>
        <LexicalAutoLinkPlugin :matchers="MATCHERS"/>
        <LexicalMarkdownShortcutPlugin :transformers="T"/>
        <LexicalOnChangePlugin v-on:change="onChange" :ignoreSelectionChange="true"/>
        <LexicalTreeViewPlugin
            v-if="isDev"
            view-class-name="tree-view-output"
            time-travel-panel-class-name="debug-timetravel-panel"
            time-travel-button-class-name="debug-timetravel-button"
            time-travel-panel-slider-class-name="debug-timetravel-panel-slider"
            time-travel-panel-button-class-name="debug-timetravel-panel-button"
        />
        <LexicalHistoryPlugin/>
        <LexicalListPlugin/>
        <LexicalCheckListPlugin/>
        <LexicalTabIndentationPlugin/>
        <LexicalReloadPlugin :transformers="T"/>
      </div>
    </div>
  </LexicalComposer>
</template>

<style lang="scss">
@import 'github-markdown-css/github-markdown-light.css';
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