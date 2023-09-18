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
import {EMOJI, EmojiNode} from "@/nodes/emoji";
import {$convertToMarkdownString, TRANSFORMERS} from "@lexical/markdown";
import type {Transformer} from "@lexical/markdown";
import {IMAGE, ImageNode} from "@/nodes/image";
import LexicalOnChangePlugin from '@/components/LexicalOnChangePlugin.vue'
import {MessageType} from "@/message";
import {DIVIDER, DividerNode} from "@/nodes/divider";
import {ref} from "vue";
import {useRoute} from "vue-router";
import ToolbarPlugin from "@/components/ToolbarPlugin.vue";
import LexicalEditablePlugin from "@/components/LexicalEditablePlugin.vue";
import LexicalUnEditableOnBlurPlugin from "@/components/LexicalUnEditableOnBlurPlugin.vue";
import LexicalMinHeightWhenEditingPlugin from "@/components/LexicalMinHeightWhenEditingPlugin.vue";
import LexicalCodeHighlightPlugin from "@/components/LexicalCodeHighlightPlugin.vue";
import LexicalAutoAddBlockWhenArrowPlugin from "@/components/LexicalAutoAddBlockWhenArrowPlugin.vue";
import {
  COLLAPSIBLE,
  COLLAPSIBLE_HTML,
  COLLAPSIBLE_TITLE_HTML,
  CollapsibleContainerNode
} from "@/nodes/CollapsibleContainerNode";
import {CollapsibleContentNode} from "@/nodes/CollapsibleContentNode";
import {CollapsibleTitleNode} from "@/nodes/CollapsibleTitleNode";
import {HTML, HtmlNode} from "@/nodes/html";

const route = useRoute()
const isDev = ref(route.query.is_dev !== 'false')
const isEditable = ref(route.query.is_editable !== 'false')


const config = {
  editable: isEditable.value,
  theme: {
    'ltr': 'ltr',
    'rtl': 'rtl',
    'placeholder': 'editor-placeholder',
    'paragraph': 'editor-paragraph',
    'quote': 'editor-quote',
    'heading': {
      h1: 'editor-heading-h1',
      h2: 'editor-heading-h2',
      h3: 'editor-heading-h3',
      h4: 'editor-heading-h4',
      h5: 'editor-heading-h5',
    },
    'list': {
      nested: {
        listitem: 'editor-nested-listitem',
      },
      ol: 'editor-list-ol',
      ul: 'editor-list-ul',
      listitem: 'editor-listitem',
    },
    'image': 'editor-image',
    'm-latex': 'editor-latex',
    'link': 'editor-link',
    'hashtag': 'editor-text-hashtag',
    'text': {
      bold: 'editor-text-bold',
      italic: 'editor-text-italic',
      underline: 'editor-text-underline',
      strikethrough: 'editor-text-strikethrough',
      underlineStrikethrough: 'editor-text-underlineStrikethrough',
      code: 'editor-text-code',
    },
    'code': 'editor-code',
    'codeHighlight': {
      'atrule': 'editor-tokenAttr',
      'attr': 'editor-tokenAttr',
      'boolean': 'editor-tokenProperty',
      'builtin': 'editor-tokenSelector',
      'cdata': 'editor-tokenComment',
      'char': 'editor-tokenSelector',
      'class': 'editor-tokenFunction',
      'class-name': 'editor-tokenFunction',
      'comment': 'editor-tokenComment',
      'constant': 'editor-tokenProperty',
      'deleted': 'editor-tokenProperty',
      'doctype': 'editor-tokenComment',
      'entity': 'editor-tokenOperator',
      'function': 'editor-tokenFunction',
      'important': 'editor-tokenVariable',
      'inserted': 'editor-tokenSelector',
      'keyword': 'editor-tokenAttr',
      'namespace': 'editor-tokenVariable',
      'number': 'editor-tokenProperty',
      'operator': 'editor-tokenOperator',
      'prolog': 'editor-tokenComment',
      'property': 'editor-tokenProperty',
      'punctuation': 'editor-tokenPunctuation',
      'regex': 'editor-tokenVariable',
      'selector': 'editor-tokenSelector',
      'string': 'editor-tokenSelector',
      'symbol': 'editor-tokenProperty',
      'tag': 'editor-tokenProperty',
      'url': 'editor-tokenOperator',
      'variable': 'editor-tokenVariable',
    },
    'divider': 'editor-divider',
  },
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
    CollapsibleContainerNode,
    CollapsibleContentNode,
    CollapsibleTitleNode,
    HtmlNode,
  ],
}
const onError = (error) => {
  console.error(error)
}

const T: Transformer[] = [HTML, COLLAPSIBLE_HTML, COLLAPSIBLE_TITLE_HTML, COLLAPSIBLE, DIVIDER, IMAGE, EMOJI, ...TRANSFORMERS]

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

const onChange = (editorState, editor, tags: Set<string>) => {
  if (tags.has('reload') || tags.has('history-merge')) {
    return
  }
  const markdown = editor
      .getEditorState()
      .read(() => $convertToMarkdownString(T))
  const message: MessageType = {
    type: 'update',
    text: markdown,
    source: 'child'
  }
  window.parent.postMessage(message, '*')
}
</script>

<template>
  <LexicalComposer :initialConfig="config" @error="onError">
    <div class="editor-container">
      <ToolbarPlugin/>
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
        <LexicalCodeHighlightPlugin/>
        <LexicalTabIndentationPlugin/>
        <LexicalReloadPlugin :transformers="T"/>
        <LexicalEditablePlugin/>
        <LexicalUnEditableOnBlurPlugin/>
        <LexicalMinHeightWhenEditingPlugin/>
        <LexicalAutoAddBlockWhenArrowPlugin/>

      </div>
    </div>
  </LexicalComposer>
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