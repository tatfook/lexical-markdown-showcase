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
      html: '<h1><span style="white-space: pre-wrap;">Hello world</span></h1>',
      md: '# Hello world :grinning:',
    },
  ];

  const HIGHLIGHT_TEXT_MATCH_IMPORT: TextMatchTransformer = {
    ...LINK,
    importRegExp: /\$([^$]+?)\$/,
    replace: (textNode) => {
      textNode.setFormat('highlight');
    },
  };

  for (const {html, md, skipImport} of IMPORT_AND_EXPORT) {
    if (skipImport) {
      continue;
    }

    it(`can import "${md.replace(/\n/g, '\\n')}"`, () => {
      const editor = createHeadlessEditor({
        nodes: [
          HeadingNode,
          ListNode,
          ListItemNode,
          QuoteNode,
          CodeNode,
          LinkNode,
          CodeNode,
          CodeHighlightNode,
          EmojiNode
        ],
      });

      editor.update(
        () =>
          $convertFromMarkdownString(md, [
            EMOJI,
            ...TRANSFORMERS,
            HIGHLIGHT_TEXT_MATCH_IMPORT,
          ]),
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
      const editor = createHeadlessEditor({
        nodes: [
          HeadingNode,
          ListNode,
          ListItemNode,
          QuoteNode,
          CodeNode,
          LinkNode,
        ],
      });

      editor.update(
        () => {
          const parser = new DOMParser();
          const dom = parser.parseFromString(html, 'text/html');
          const nodes = $generateNodesFromDOM(editor, dom);
          $getRoot().select();
          $insertNodes(nodes);
        },
        {
          discrete: true,
        },
      );

      expect(
        editor
          .getEditorState()
          .read(() => $convertToMarkdownString(TRANSFORMERS)),
      ).toBe(exportMd ?? md);
    });
  }
});
