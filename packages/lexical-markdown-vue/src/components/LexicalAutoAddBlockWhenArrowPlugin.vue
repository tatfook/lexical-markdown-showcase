<script lang="ts" setup>
import { useEditor } from 'lexical-vue';
import { onMounted, onUnmounted } from 'vue';
import { mergeRegister } from '@lexical/utils';
import type { GridSelection, LexicalEditor, NodeSelection, RangeSelection } from 'lexical';
import {
  $createParagraphNode,
  $getNearestNodeFromDOMNode, $getNodeByKey,
  $getRoot, $isElementNode, $isNodeSelection,
  $isRangeSelection, COMMAND_PRIORITY_HIGH,
  KEY_ARROW_DOWN_COMMAND, KEY_ARROW_LEFT_COMMAND, KEY_ARROW_RIGHT_COMMAND,
  KEY_ARROW_UP_COMMAND, TextNode,
} from 'lexical';
import {$isImageNode} from "@/nodes/image";
import {CodeHighlightNode, CodeNode} from "@lexical/code";

const editor = useEditor()

let unregister: () => void

const $isInsertFirstWhenSelectionNull = (event: KeyboardEvent) => {
  const isLatexEditing = (event.target as HTMLElement).closest('.EquationEditor_blockEditor') !== null
  if (!isLatexEditing) {
    console.warn('isLatexEditing', isLatexEditing, 'isLatexEditing')
    return false
  }

  try {
    const range = window.getSelection()!.getRangeAt(0)
    // 只有在光标在最前面的时候才会触发，只有在第一个子节点的时候才会触发
    if (range.startOffset !== 0 || range.startOffset !== range.endOffset
      || range.startContainer.previousSibling !== null) {
      console.warn('range.startOffset', range.startOffset, 'range.startContainer', range.startContainer)
      return false
    }
    const dom = (event.target as HTMLElement).closest('.editor-latex') as HTMLElement
    if (!dom) {
      console.warn('dom not .editor-latex')
      return false
    }
    editor.update(() => {
      // 加上getTopLevelElement()是因为在latex编辑器中，加上一了一层m-paragraph的包裹
      let node = $getNearestNodeFromDOMNode(dom)
      if ($isElementNode(node)) {
        node = node.getTopLevelElement()
      }
      if (!node) {
        return
      }
      const root = $getRoot()
      // 只有在第一个子节点的时候才会触发
      const isFirstChild = root.getFirstChild()?.getKey() === node.getKey();
      if (!isFirstChild) {
        console.warn('isFirstChild', isFirstChild)
        return
      }
      const p = $createParagraphNode()
      root.getFirstChild()?.insertBefore(p)
      p.select()
    })
  } catch (e) {
    console.error(e)
    return false
  }
  return false
}

const $isInsertLastWhenSelectionNull = (event: KeyboardEvent) => {
  const isLatexEditing = (event.target as HTMLElement).closest('.EquationEditor_blockEditor') !== null
  if (!isLatexEditing) {
    return false
  }

  try {
    const range = window.getSelection()!.getRangeAt(0)
    // 只有在光标在最前面的时候才会触发
    if (range.startOffset !== range.startContainer.textContent!.length || range.startOffset !== range.endOffset
      || range.startContainer.nextSibling !== null) {
      return false
    }
    const dom = (event.target as HTMLElement).closest('.editor-latex') as HTMLElement
    if (!dom) {
      return false
    }
    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(dom)
      if (!node) {
        return
      }
      const root = $getRoot()
      // 只有在第一个子节点的时候才会触发
      const isLastChild = root.getLastChild()?.getKey() === node.getKey();
      if (!isLastChild) {
        return
      }
      const p = $createParagraphNode()
      root.append(p)
      p.select()
    })
  } catch (e) {
    return false
  }
  return false
}

const $isLastNodeImage = (selection: RangeSelection | NodeSelection | GridSelection) => {
  if ($isNodeSelection(selection) && selection.getNodes().length === 1) {
    const anchorKey = selection.getNodes()[0].getKey()
    if (!anchorKey) {
      return
    }

    const anchorNode = $getNodeByKey(anchorKey)
    const elementNode = anchorNode?.getTopLevelElement()
    if ($isImageNode(anchorNode) && elementNode === $getRoot().getLastChild()) {
      return true
    }
  }
}
const $isFirstNodeImage = (selection: RangeSelection | NodeSelection | GridSelection) => {
  if ($isNodeSelection(selection) && selection.getNodes().length === 1) {
    const anchorKey = selection.getNodes()[0].getKey()
    if (!anchorKey) {
      return
    }

    const anchorNode = $getNodeByKey(anchorKey)
    const elementNode = anchorNode?.getTopLevelElement()
    if ($isImageNode(anchorNode) && elementNode === $getRoot().getFirstChild()) {
      return true
    }
  }
}

const handlerUp = (event: KeyboardEvent, editor: LexicalEditor): boolean => {
  const isInsert = editor.getEditorState().read(() => {
    const selection = editor.getEditorState()._selection
    // 若为第一个节点为图片，则返回true
    // 先不处理图片节点的情况
    // if ($isFirstNodeImage(selection)) {
    //   return true
    // }
    // 判断是否是选中图片后键盘点击向上
    if (!$isRangeSelection(selection) && $isImageNode(!$isRangeSelection(selection) && (selection?.getNodes()[0]))) {
      event.preventDefault();
      return false
    }

    if (!$isRangeSelection(selection)) {
      console.warn('selection not $isRangeSelection')
      return $isInsertFirstWhenSelectionNull(event)
    }

    const node = selection.anchor.getNode()
    const root = $getRoot()
    if (root.getFirstChild()?.getKey() !== node.getTopLevelElement()?.getKey())
      return false

    switch (node.getType()) {
      case CodeNode.getType():
        return true
      case CodeHighlightNode.getType():
      case TextNode.getType():
        const isFirstChild = node.getTopLevelElement()!.getFirstChild().getKey() === node.getKey();
        return isFirstChild && selection.anchor.offset === 0
    }
    return false
  })
  if (!isInsert)
    return false

  editor.update(() => {
    const p = $createParagraphNode()
    const root = $getRoot()
    root.getFirstChild()!.insertBefore(p)
    p.select()
  })
  return false
}

const handlerLeft = (event: KeyboardEvent, editor: LexicalEditor): boolean => {
  const isInsert = editor.getEditorState().read(() => {
    const selection = editor.getEditorState()._selection
    // 若为第一个节点为图片，则返回true
    // 先不处理图片节点的情况
    return false;//$isFirstNodeImage(selection);
  })
  if (!isInsert)
    return false

  editor.update(() => {
    const p = $createParagraphNode()
    const root = $getRoot()
    root.getFirstChild()?.insertBefore(p)
    p.select()
  })
  return false
}

const handlerRight = (event: KeyboardEvent, editor: LexicalEditor): boolean => {
  const isInsert = editor.getEditorState().read(() => {
    const selection = editor.getEditorState()._selection
    // 若为第一个节点为图片，则返回true
    // 先不处理图片节点的情况
    return false//$isLastNodeImage(selection);
  })
  if (!isInsert)
    return false

  editor.update(() => {
    const p = $createParagraphNode()
    const root = $getRoot()
    root.append(p)
    p.select()
  })
  return false
}

const handlerDown = (event: KeyboardEvent, editor: LexicalEditor): boolean => {
  const isInsert = editor.getEditorState().read(() => {
    const selection = editor.getEditorState()._selection
    // 若为最后一个节点为图片，则返回true
    // 先不处理图片节点的情况
    // if ($isLastNodeImage(selection)) {
    //   return true
    // }
    if (!$isRangeSelection(selection)) {
      return $isInsertLastWhenSelectionNull(event)
    }

    const node = selection.anchor.getNode()
    const elementNode = node.getTopLevelElement()

    const root = $getRoot()

    if (root.getLastChild()?.getKey() !== elementNode?.getKey())
      return false
    switch (node.getType()) {
      case CodeNode.getType():
        return true
      case CodeHighlightNode.getType():
      case TextNode.getType():
        const isLastChild = elementNode!.getLastChild()?.getKey() === node.getKey();
        return isLastChild && selection.anchor.offset === elementNode!.getLastChild()?.getTextContent().length
    }
    return false
  })
  if (!isInsert)
    return false
  editor.update(() => {
    const p = $createParagraphNode()
    const root = $getRoot()
    root.append(p)
    p.select()
  })
  return false
}

onMounted(() => {
  unregister = mergeRegister(
    editor.registerCommand<KeyboardEvent>(
      KEY_ARROW_UP_COMMAND,
      (event) => {
        return handlerUp(event, editor);
      },
      COMMAND_PRIORITY_HIGH,
    ),
    editor.registerCommand<KeyboardEvent>(
      KEY_ARROW_DOWN_COMMAND,
      (event) => {
        return handlerDown(event, editor);
      },
      COMMAND_PRIORITY_HIGH,
    ),
    editor.registerCommand<KeyboardEvent>(
      KEY_ARROW_LEFT_COMMAND,
      (event) => {
        return handlerLeft(event, editor);
      },
      COMMAND_PRIORITY_HIGH,
    ),
    editor.registerCommand<KeyboardEvent>(
      KEY_ARROW_RIGHT_COMMAND,
      (event) => {
        return handlerRight(event, editor);
      },
      COMMAND_PRIORITY_HIGH,
    ),
  )
})

onUnmounted(() => {
  unregister()
})
</script>

<template />

<style scoped lang="scss">

</style>
