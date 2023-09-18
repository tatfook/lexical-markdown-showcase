import {
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode, DOMConversionMap, DOMConversionOutput, DOMExportOutput, EditorConfig,
  ElementNode, LexicalEditor, NodeKey, SerializedElementNode, Spread
} from 'lexical'
import type { LexicalNode } from 'lexical'
import { ElementTransformer } from '@lexical/markdown'
import { $createCollapsibleTitleNode, $isCollapsibleTitleNode, CollapsibleTitleNode } from './CollapsibleTitleNode'
import {
  $createCollapsibleContentNode,
  $isCollapsibleContentNode,
  CollapsibleContentNode
  // @ts-ignore
} from './CollapsibleContentNode'

type SerializedCollapsibleContainerNode = Spread<
  {
    open: boolean;
    level: number;
  },
  SerializedElementNode
>;

export function convertDetailsElement(
  domNode: HTMLDetailsElement,
): DOMConversionOutput | null {
  const isOpen = domNode.open !== undefined ? domNode.open : true
  const node = $createCollapsibleContainerNode(isOpen, 1)
  return {
    node,
  }
}

export class CollapsibleContainerNode extends ElementNode {
  __open: boolean
  // 1 to 6
  __level: number

  constructor(open: boolean, level: number, key?: NodeKey) {
    super(key)
    this.__open = open
    this.__level = level
  }

  static getType(): string {
    return 'collapsible-container'
  }

  static clone(node: CollapsibleContainerNode): CollapsibleContainerNode {
    return new CollapsibleContainerNode(node.__open, node.__level, node.__key)
  }

  createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
    const dom = document.createElement('details')
    dom.classList.add('Collapsible__container')
    dom.open = this.__open
    dom.addEventListener('toggle', () => {
      const open = editor.getEditorState().read(() => this.getOpen())
      if (open !== dom.open) {
        editor.update(() => this.toggleOpen())
      }
    })
    return dom
  }

  updateDOM(
    prevNode: CollapsibleContainerNode,
    dom: HTMLDetailsElement,
    config: EditorConfig,
  ): boolean {
    if (prevNode.__open !== this.__open) {
      if (this.__open) {
        dom.setAttribute('open', '')
      } else {
        dom.removeAttribute('open')
      }
    }
    return false
  }

  static importDOM(): DOMConversionMap<HTMLDetailsElement> | null {
    return {
      details: (domNode: HTMLDetailsElement) => {
        return {
          conversion: convertDetailsElement,
          priority: 1,
        }
      },
    }
  }

  static importJSON(
    serializedNode: SerializedCollapsibleContainerNode,
  ): CollapsibleContainerNode {
    const node = $createCollapsibleContainerNode(serializedNode.open, serializedNode.level)
    return node
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('details')
    if (this.__open) {
      element.setAttribute('open', '')
    }
    return { element }
  }

  exportJSON(): SerializedCollapsibleContainerNode {
    return {
      ...super.exportJSON(),
      open: this.__open,
      level: this.__level,
      type: 'collapsible-container',
      version: 1,
    }
  }

  setOpen(open: boolean): void {
    const writable = this.getWritable()
    writable.__open = open
  }

  getOpen(): boolean {
    return this.getLatest().__open
  }

  toggleOpen(): void {
    this.setOpen(!this.getOpen())
  }
}

export function $createCollapsibleContainerNode(
  isOpen: boolean,
  level: number,
): CollapsibleContainerNode {
  return new CollapsibleContainerNode(isOpen, level)
}

export function $isCollapsibleContainerNode(
  node: LexicalNode | null | undefined,
): node is CollapsibleContainerNode {
  return node instanceof CollapsibleContainerNode
}

export const COLLAPSIBLE: ElementTransformer = {
  dependencies: [CollapsibleContainerNode, CollapsibleContentNode, CollapsibleTitleNode],
  export: (node: LexicalNode, exportChildren: (elementNode: ElementNode) => string) => {
    if (!$isCollapsibleContainerNode(node)) {
      return null
    }

    function repeatString(str: string, times: number): string {
      let result = ''
      for (let i = 0; i < times; i++) {
        result += str
      }
      return result
    }

    const titleNodes = node.getChildren().filter(n => $isCollapsibleTitleNode(n))

    // #
    const markSymbol = repeatString('#', node.__level)

    if (titleNodes.length !== 1) {
      return markSymbol + `${node.getOpen() ? '>>' : '>'} \n` + markSymbol
    }
    const title = titleNodes[0].getTextContent()

    const contentNodes = node.getChildren().filter(n => $isCollapsibleContentNode(n))
    if (contentNodes.length !== 1) {
      return markSymbol + `${node.getOpen() ? '>>' : '>'} ${title}\n` + markSymbol
    }
    // @ts-ignore
    return markSymbol + `${node.getOpen() ? '>>' : '>'} ${title}\n${exportChildren(contentNodes[0] as ElementNode)}\n` + markSymbol
  },
  getNumberOfLines: (lines: string[], startLineIndex: number) => {
    const REG_EXP = /^(\#{1,6})\s?(\>{0,2})(.*)/
    const questionMatch = lines[startLineIndex].match(REG_EXP)
    if (!questionMatch) {
      return 1
    }
    // 如果当前的level=2即##
    const level = questionMatch[1].length // get current detail level
    let endLineIndex = startLineIndex
    const linesLength = lines.length
    while (++endLineIndex < linesLength) {
      /**
       * #> Details
       * #
       * when is line 2, just like above
       */
      if (lines[endLineIndex] === questionMatch[1]) {
        return endLineIndex - startLineIndex
      }
      /**
       * #> Details1
       * #> Details2
       * when is line 2, just like above
       */
      const closeMatch = lines[endLineIndex].match(REG_EXP)
      if (closeMatch) {
        const level2 = closeMatch[1].length // get current detail level
        // 如果当前的level=1即#，那么是一个新的块
        // 或者如果是level=2即##，那么也是一个新的块
        if (level2 <= level) {
          return endLineIndex - startLineIndex
        }
      }
    }
    return endLineIndex - startLineIndex
  },
  regExp: /^(\#{1,6})\s?(\>{1,2})\s(.*?)$/,
  closeRegExp: /^(\#{1,6})$/,
  getChildrenFromLines(lines: string[]) {
    const children: ElementNode[] = []
    let p = $createParagraphNode()
    children.push(p)
    for (const line of lines) {
      if (line !== '') {
        if (p.getChildrenSize() >= 1) {
          p.append($createLineBreakNode())
        }
        p.append($createTextNode(line))
      } else {
        p = $createParagraphNode()
        children.push(p)
      }
    }
    return children
  },
  replace: (parentNode: ElementNode, children: Array<LexicalNode>, match: Array<string>, isImport: boolean) => {
    const [, hash, greaterThan, summary] = match
    const node = $createCollapsibleContainerNode(greaterThan.length === 2, hash.length)
    const titleNode = $createCollapsibleTitleNode()
    titleNode.append($createTextNode(summary))
    node.append(titleNode)
    const contentNode = $createCollapsibleContentNode()
    contentNode.append(...children)
    node.append(contentNode)
    parentNode.replace(node)
    titleNode.select()
  },
  type: 'element',
}

export const COLLAPSIBLE_HTML: ElementTransformer = {
  dependencies: [CollapsibleContainerNode, CollapsibleContentNode, CollapsibleTitleNode],
  export: (node: LexicalNode, exportChildren: (elementNode: ElementNode) => string) => {
    if (!$isCollapsibleContainerNode(node)) {
      return null
    }

    function repeatString(str: string, times: number): string {
      let result = ''
      for (let i = 0; i < times; i++) {
        result += str
      }
      return result
    }

    const titleNodes = node.getChildren().filter(n => $isCollapsibleTitleNode(n))

    // #
    const markSymbol = repeatString('#', node.__level)

    if (titleNodes.length !== 1) {
      return markSymbol + `${node.getOpen() ? '>>' : '>'} \n` + markSymbol
    }
    const title = titleNodes[0].getTextContent()

    const contentNodes = node.getChildren().filter(n => $isCollapsibleContentNode(n))
    if (contentNodes.length !== 1) {
      return markSymbol + `${node.getOpen() ? '>>' : '>'} ${title}\n` + markSymbol
    }
    // @ts-ignore
    return markSymbol + `${node.getOpen() ? '>>' : '>'} ${title}\n${exportChildren(contentNodes[0] as ElementNode)}\n` + markSymbol
  },
  getNumberOfLines: (lines: string[], startLineIndex: number) => {
    const REG_EXP = /^<details( open)?>$/
    const CLOSE_REG_EXP = /^<\/details>$/
    const questionMatch = lines[startLineIndex].match(REG_EXP)
    if (!questionMatch) {
      return 1
    }
    // 如果当前的level=2即##
    let endLineIndex = startLineIndex
    const linesLength = lines.length
    while (++endLineIndex < linesLength) {
      /**
       * #> Details
       * #
       * when is line 2, just like above
       */
      if (lines[endLineIndex] === questionMatch[1]) {
        return endLineIndex - startLineIndex
      }
      /**
       * #> Details1
       * #> Details2
       * when is line 2, just like above
       */
      const closeMatch = lines[endLineIndex].match(CLOSE_REG_EXP)
      if (closeMatch) {
        return endLineIndex - startLineIndex
      }
    }
    return endLineIndex - startLineIndex
  },
  regExp: /^<details\W?(open)?>$/,
  closeRegExp: /^<\/details>$/,
  getChildrenFromLines(lines: string[]) {
    const children: ElementNode[] = []
    let p = $createParagraphNode()
    children.push(p)
    for (const line of lines) {
      if (line !== '') {
        if (p.getChildrenSize() >= 1) {
          p.append($createLineBreakNode())
        }
        p.append($createTextNode(line))
      } else {
        p = $createParagraphNode()
        children.push(p)
      }
    }
    return children
  },
  replace: (parentNode: ElementNode, children: Array<LexicalNode>, match: Array<string>, isImport: boolean) => {
    const [, open] = match
    console.log("match", match);
    const node = $createCollapsibleContainerNode(open !== undefined && open === 'open', 1)
    // const titleNode = $createCollapsibleTitleNode()
    // titleNode.append($createTextNode(summary))
    // node.append(titleNode)
    const contentNode = $createCollapsibleContentNode()
    if ($isCollapsibleTitleNode(children[0])) {
      node.append(children[0])
      // from index 1 to the last
      contentNode.append(...children.slice(1))
    } else {
      contentNode.append(...children)
    }

    node.append(contentNode)
    parentNode.replace(node)
    // titleNode.select()
  },
  type: 'element',
}

export const COLLAPSIBLE_TITLE_HTML: ElementTransformer = {
  dependencies: [CollapsibleContainerNode, CollapsibleContentNode, CollapsibleTitleNode],
  export: (node: LexicalNode, exportChildren: (elementNode: ElementNode) => string) => {
    // 交给container node 处理
    return null
  },
  regExp: /^\W*?<summary>(.*?)<\/summary>$/,
  replace: (parentNode: ElementNode, children: Array<LexicalNode>, match: Array<string>, isImport: boolean) => {
    const [, summary] = match
    if (!summary) {
      return
    }
    const titleNode = $createCollapsibleTitleNode()
    titleNode.append($createTextNode(summary))
    const pp = parentNode.getParent()
    if (pp && $isCollapsibleContentNode(pp)) {
      console.log('insertBefore')
      pp.insertBefore(titleNode)
    } else {
      console.log('replace', pp)
      parentNode.replace(titleNode)
    }
  },
  type: 'element',
}