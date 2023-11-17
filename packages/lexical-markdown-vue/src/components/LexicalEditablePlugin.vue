<script setup lang="ts">

import {useEditor, useMounted} from "lexical-vue";
import {
  $createRangeSelection,
  $getNodeByKey,
  $isTextNode,
  $setSelection,
  ElementNode, TextNode
} from "lexical";
import {useMouse} from "@vueuse/core";

const editor = useEditor()
const mouse = useMouse({type: 'client'})

const getNodeElementByHTMLNode = (node: Node, range: Range) => {
  if (range.startContainer.parentElement?.closest('[data-lexical-decorator]')) {
    return range.startContainer.parentElement?.closest('[data-lexical-decorator]')
  } else if (node.nodeType === 1) {
    return range.startContainer
  } else {
    return range.startContainer.parentElement
  }
}

const focus = (event: MouseEvent) => {
  const range = document.caretRangeFromPoint(mouse.x.value, mouse.y.value)
  if (!range || ![1, 3].includes(range.startContainer.nodeType)) {
    console.warn('select end', range?.startContainer.nodeType)
    editor.focus(undefined, {defaultSelection: 'rootEnd'})
    return
  }
  editor.focus(() => {
    let startNodeKey: string | undefined
    let endNodeKey: string | undefined
    const start = getNodeElementByHTMLNode(range.startContainer, range)
    const end = getNodeElementByHTMLNode(range.endContainer, range)
    for (const key of Array.from(editor._keyToDOMMap.keys())) {
      const domValue = editor._keyToDOMMap.get(key)
      if (domValue === start) {
        startNodeKey = key
      }
      if (domValue === end) {
        endNodeKey = key
      }
    }
    if (!(startNodeKey && endNodeKey)) {
      console.warn('startNodeKey and endNodeKey', startNodeKey, endNodeKey)
      console.warn('start', start, 'end', end)
      return;
    }
    editor.update(() => {
      const startNode = $getNodeByKey(startNodeKey!)
      if ($isTextNode(startNode)) {
        const rangeSelection = $createRangeSelection()
        rangeSelection.setTextNodeRange(startNode, range.startOffset, $getNodeByKey(endNodeKey!) as TextNode, range.endOffset)
        $setSelection(rangeSelection)
      } else {
        const elementNode = startNode as ElementNode
        elementNode.select()
        // if ($isLatexNode(elementNode)) {
        //   elementNode.setEditing(true)
        // } else {
        //   elementNode.select()
        // }
      }
    }, {
      onUpdate() {
        // editor.getRootElement().closest('.meogic__tab').scrollTo(0, 0)
      },
    })
  })
}

const onClick = (event: MouseEvent) => {
  if (!editor._editable) {
    editor.setEditable(true)
    focus(event)
  }
}

useMounted(() => {
  const rootElement = editor.getRootElement()
  rootElement && rootElement.addEventListener('click', onClick)
  return () => {
    rootElement && rootElement.removeEventListener('click', onClick)
  }
})

</script>

<template>

</template>

<style scoped>

</style>