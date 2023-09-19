import {
  DOMExportOutput,
  EditorConfig,
  ElementNode,
  LexicalEditor, LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread
} from "lexical";
import {ElementTransformer} from "@lexical/markdown";

type SerializedHtmlNode = Spread<
  {
    html: string
  },
  SerializedElementNode
>;


/**
 * only used for style tag
 */
export class HtmlNode extends ElementNode {
  __html: string


  constructor(html: string, key?: NodeKey) {
    super(key);
    this.__html = html;
  }

  static getType(): string {
    return 'html'
  }

  static clone(node: HtmlNode): HtmlNode {
    return new HtmlNode(node.__html, node.__key)
  }

  getHtml(): string {
    return this.getLatest().__html;
  }

  // writable
  setHtml(html: string): HtmlNode {
    const writable = this.getWritable()
    writable.__html = html
    return this
  }

  createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
    const p = document.createElement('p');
    p.style.display = 'none'
    p.innerHTML = this.getHtml();

    // @ts-ignore
    return p;
  }

  updateDOM(prevNode: HtmlNode, dom: HTMLElement, config: EditorConfig): boolean {
    return this.getHtml() !== prevNode.getHtml()
  }

  static importJSON(serializedNode: SerializedHtmlNode): HtmlNode {
    return $createHtmlNode(serializedNode.html)
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const parser = new DOMParser();
    // @ts-ignore
    const element = parser.parseFromString(this.getHtml(), 'text/html') as HTMLElement;
    return {
      element
    };
  }

  exportJSON(): SerializedHtmlNode {
    return {
      ...super.exportJSON(),
      type: 'html',
      version: 1,
      html: this.getHtml()
    };
  }
}

export function $createHtmlNode(html: string): HtmlNode {
  return new HtmlNode(html)
}

export function $isHtmlNode(node: LexicalNode | null | undefined): node is HtmlNode {
  return node instanceof HtmlNode
}

export const HTML: ElementTransformer = {
  dependencies: [HtmlNode],
  export: (node: LexicalNode, exportChildren: (elementNode: ElementNode) => string) => {
    if (!$isHtmlNode(node)) {
      return null
    }
    return node.getHtml()
  },
  getNumberOfLines(lines: string[], startLineIndex: number){
    const INLINE_REG_EXP = /<style>([\s\S]*)<\/style>/
    const isInline = lines[startLineIndex].match(INLINE_REG_EXP) !== null
    if (isInline) {
      return 1
    }
    const START_REG_EXP = /<style>/
    const END_REG_EXP = /<\/style>/
    let endLineIndex = startLineIndex
    const linesLength = lines.length
    while (++endLineIndex < linesLength) {
      if (lines[endLineIndex].match(END_REG_EXP) !== null) {
        return endLineIndex - startLineIndex + 1
      }
    }
    return endLineIndex - startLineIndex
  },
  regExp: /<style>([\s\S]*)(<\/style>)?/,
  replace: (parentNode: ElementNode, children: Array<LexicalNode>, match: Array<string>, isImport: boolean) => {
    const [ html ] = match
    let resultHtml = html
    if (children.length === 0) {
      // html will be <style>img{max-width: 50% !important;}</style>
    } else {
      // html will be <style>img if there is a break line
      resultHtml += '\n' + children.map(child => child.getTextContent()).join('\n')
    }
    const node = $createHtmlNode(resultHtml)
    parentNode.replace(node)

  },
  type: 'element'
}
