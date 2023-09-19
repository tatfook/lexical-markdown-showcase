/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {CodeHighlightNode, CodeNode} from '@lexical/code';
import {createHeadlessEditor} from '@lexical/headless';
import {$generateHtmlFromNodes, $generateNodesFromDOM} from '@lexical/html';
import {LinkNode} from '@lexical/link';
import {ListItemNode, ListNode} from '@lexical/list';
import {HeadingNode, QuoteNode} from '@lexical/rich-text';
import {$getRoot, $insertNodes, $isElementNode, LexicalNode} from 'lexical';

import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  LINK,
  TextMatchTransformer,
  TRANSFORMERS,
} from '@lexical/markdown';
import {EMOJI, EmojiNode} from "../../src/nodes/emoji";
import {
  COLLAPSIBLE,
  COLLAPSIBLE_HTML,
  COLLAPSIBLE_TITLE_HTML,
  CollapsibleContainerNode
} from "../../src/nodes/CollapsibleContainerNode";
import {CollapsibleTitleNode} from "../../src/nodes/CollapsibleTitleNode";
import {CollapsibleContentNode} from "../../src/nodes/CollapsibleContentNode";
import {transformersByType} from "@lexical/markdown/utils";
import {parseMarkdownString} from "@lexical/markdown/MarkdownImport";

function invariant(
  cond?: boolean,
  message?: string,
  ...args: string[]
): asserts cond {
  if (cond) {
    return;
  }
  console.log("args", args);

  throw new Error(
    'Internal Lexical error: invariant() is meant to be replaced at compile ' +
    'time. There is no runtime version. Error: ' +
    message,
  );
}

function exportNodeToJSON<SerializedNode>(node: LexicalNode, keys?: string[]): SerializedNode {
  const serializedNode = node.exportJSON();
  if (keys) {
    // 遍历serializedNode的key，然后不存在keys中的就删除
    for (const key in serializedNode) {
      if (!keys.includes(key)) {
        // @ts-ignore
        delete serializedNode[key];
      }
    }
  }
  const nodeClass = node.constructor;

  // @ts-expect-error TODO Replace Class utility type with InstanceType
  if (serializedNode.type !== nodeClass.getType()) {
    invariant(
      false,
      'LexicalNode: Node %s does not match the serialized type. Check if .exportJSON() is implemented and it is returning the correct type.',
      nodeClass.name,
    );
  }

  // @ts-expect-error TODO Replace Class utility type with InstanceType
  const serializedChildren = serializedNode.children;

  if ($isElementNode(node)) {
    if (!Array.isArray(serializedChildren)) {
      invariant(
        false,
        'LexicalNode: Node %s is an element but .exportJSON() does not have a children array.',
        nodeClass.name,
      );
    }

    const children = node.getChildren();

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const serializedChildNode = exportNodeToJSON(child, keys);
      serializedChildren.push(serializedChildNode);
    }
  }

  // @ts-expect-error
  return serializedNode;
}

const HIGHLIGHT_TEXT_MATCH_IMPORT: TextMatchTransformer = {
  ...LINK,
  importRegExp: /\$([^$]+?)\$/,
  replace: (textNode) => {
    textNode.setFormat('highlight');
  },
};

const T = [
  COLLAPSIBLE_HTML,
  COLLAPSIBLE_TITLE_HTML,
  COLLAPSIBLE,
  EMOJI,
  ...TRANSFORMERS,
  HIGHLIGHT_TEXT_MATCH_IMPORT,
]

function createEditor() {
  return createHeadlessEditor({
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      LinkNode,
      CodeNode,
      CodeHighlightNode,
      CollapsibleContainerNode,
      CollapsibleTitleNode,
      CollapsibleContentNode
    ],
  })
}

describe('Markdown', () => {
  type Input = Array<{
    html: string;
    md: string;
    skipExport?: true;
    skipImport?: true;
    exportMd?: string;
  }>;

  const IMPORT_AND_EXPORT: Input = [
    {
      html: '<pre spellcheck="false" data-highlight-language="html"><p><span style="white-space: pre-wrap;">&lt;style&gt;</span><br><span style="white-space: pre-wrap;">\t.markdown-body {</span><br><span style="white-space: pre-wrap;">\t\tbox-sizing: border-box;</span><br><span style="white-space: pre-wrap;">\t\tmin-width: 200px;</span><br><span style="white-space: pre-wrap;">\t\tmax-width: 980px;</span><br><span style="white-space: pre-wrap;">\t\tmargin: 0 auto;</span><br><span style="white-space: pre-wrap;">\t\tpadding: 45px;</span><br><span style="white-space: pre-wrap;">\t}</span><br><span style="white-space: pre-wrap;">&lt;/style&gt;</span></p></pre>',
      md: `\`\`\`html
<style>
\t.markdown-body {
\t\tbox-sizing: border-box;
\t\tmin-width: 200px;
\t\tmax-width: 980px;
\t\tmargin: 0 auto;
\t\tpadding: 45px;
\t}
</style>
\`\`\``,
    },
    {
      html: '<details><summary><span style="white-space: pre-wrap;">Summary</span></summary><div data-lexical-collapsible-content="true"><p><span style="white-space: pre-wrap;">content</span></p></div></details>',
      md: `<details>
<summary>Summary</summary>
content
</details>`,
      exportMd: `#> Summary
content
#`
    }
  ];

  for (const {html, md, skipImport} of IMPORT_AND_EXPORT) {
    if (skipImport) {
      continue;
    }

    it(`can import "${md.replace(/\n/g, '\\n')}"`, () => {
      const editor = createEditor()

      editor.update(
        () =>
          $convertFromMarkdownString(md, T),
        {
          discrete: true,
        },
      );

      const json = editor.getEditorState().read(() => JSON.stringify(exportNodeToJSON($getRoot(), ['type', 'text', 'children']), null, 2))
      console.log("json", json);


      expect(
        editor.getEditorState().read(() => $generateHtmlFromNodes(editor)),
      ).toBe(html);
    });
  }

  for (const {html, md, exportMd, skipExport} of IMPORT_AND_EXPORT) {
    if (skipExport) {
      continue;
    }

    it(`can export "${md.replace(/\n/g, '\\n')}"`, () => {
      const editor = createEditor()

      editor.update(
        () =>
          $convertFromMarkdownString(md, T),
        {
          discrete: true,
        },
      );

      expect(
        editor
          .getEditorState()
          .read(() => $convertToMarkdownString(T)),
      ).toBe(exportMd ?? md);
    });
  }
});
