import {$applyNodeReplacement, EditorConfig, LexicalNode, NodeKey, SerializedTextNode, Spread, TextNode} from "lexical";
import {TextMatchTransformer} from "@lexical/markdown";

const EMOJI_DATA = {
  "grinning": "😀",
  "smiley": "😃",
  "smile": "😄",
  "grin": "😁",
  "laughing": "😆",
  "satisfied": "😆",
  "sweat_smile": "😅",
  "joy": "😂",
  "wink": "😉",
  "blush": "😊",
  "innocent": "😇",
  "heart_eyes": "😍",
  "kissing_heart": "😘",
  "kissing": "😗",
  "kissing_closed_eyes": "😚",
  "kissing_smiling_eyes": "😙",
  "yum": "😋",
  "stuck_out_tongue": "😛",
  "stuck_out_tongue_winking_eye": "😜",
  "stuck_out_tongue_closed_eyes": "😝",
  "neutral_face": "😐",
  "expressionless": "😑",
  "no_mouth": "😶",
  "smirk": "😏",
  "unamused": "😒",
  "relieved": "😌",
  "pensive": "😔",
  "sleepy": "😪",
  "sleeping": "😴",
  "mask": "😷",
  "dizzy_face": "😵",
  "sunglasses": "😎",
  "confused": "😕",
  "worried": "😟",
  "open_mouth": "😮",
  "hushed": "😯",
  "astonished": "😲",
  "flushed": "😳",
  "frowning": "😦",
  "anguished": "😧",
  "fearful": "😨",
  "cold_sweat": "😰",
  "disappointed_relieved": "😥",
  "cry": "😢",
  "sob": "😭",
  "scream": "😱",
  "confounded": "😖",
  "persevere": "😣",
  "disappointed": "😞",
  "sweat": "😓",
  "weary": "😩",
  "tired_face": "😫",
  "rage": "😡",
  "pout": "😡",
  "angry": "😠",
  "smiling_imp": "😈",
  "smiley_cat": "😺",
  "smile_cat": "😸",
  "joy_cat": "😹",
  "heart_eyes_cat": "😻",
  "smirk_cat": "😼",
  "kissing_cat": "😽",
  "scream_cat": "🙀",
  "crying_cat_face": "😿",
  "pouting_cat": "😾",
  "heart": "❤️",
  "hand": "✋",
  "raised_hand": "✋",
  "v": "✌️",
  "point_up": "☝️",
  "fist_raised": "✊",
  "fist": "✊",
  "monkey_face": "🐵",
  "cat": "🐱",
  "cow": "🐮",
  "mouse": "🐭",
  "coffee": "☕",
  "hotsprings": "♨️",
  "anchor": "⚓",
  "airplane": "✈️",
  "hourglass": "⌛",
  "watch": "⌚",
  "sunny": "☀️",
  "star": "⭐",
  "cloud": "☁️",
  "umbrella": "☔",
  "zap": "⚡",
  "snowflake": "❄️",
  "sparkles": "✨",
  "black_joker": "🃏",
  "mahjong": "🀄",
  "phone": "☎️",
  "telephone": "☎️",
  "envelope": "✉️",
  "pencil2": "✏️",
  "black_nib": "✒️",
  "scissors": "✂️",
  "wheelchair": "♿",
  "warning": "⚠️",
  "aries": "♈",
  "taurus": "♉",
  "gemini": "♊",
  "cancer": "♋",
  "leo": "♌",
  "virgo": "♍",
  "libra": "♎",
  "scorpius": "♏",
  "sagittarius": "♐",
  "capricorn": "♑",
  "aquarius": "♒",
  "pisces": "♓",
  "heavy_multiplication_x": "✖️",
  "heavy_plus_sign": "➕",
  "heavy_minus_sign": "➖",
  "heavy_division_sign": "➗",
  "bangbang": "‼️",
  "interrobang": "⁉️",
  "question": "❓",
  "grey_question": "❔",
  "grey_exclamation": "❕",
  "exclamation": "❗",
  "heavy_exclamation_mark": "❗",
  "wavy_dash": "〰️",
  "recycle": "♻️",
  "white_check_mark": "✅",
  "ballot_box_with_check": "☑️",
  "heavy_check_mark": "✔️",
  "x": "❌",
  "negative_squared_cross_mark": "❎",
  "curly_loop": "➰",
  "loop": "➿",
  "part_alternation_mark": "〽️",
  "eight_spoked_asterisk": "✳️",
  "eight_pointed_black_star": "✴️",
  "sparkle": "❇️",
  "copyright": "©️",
  "registered": "®️",
  "tm": "™️",
  "information_source": "ℹ️",
  "m": "Ⓜ️",
  "black_circle": "⚫",
  "white_circle": "⚪",
  "black_large_square": "⬛",
  "white_large_square": "⬜",
  "black_medium_square": "◼️",
  "white_medium_square": "◻️",
  "black_medium_small_square": "◾",
  "white_medium_small_square": "◽",
  "black_small_square": "▪️",
  "white_small_square": "▫️",
  "point_right": "👉",
  "point_left": "👈"
}

export type SerializedEmojiNode = Spread<
  {
  },
  SerializedTextNode
>;

export class EmojiNode extends TextNode {

  static getType(): string {
    return 'emoji';
  }

  static clone(node: EmojiNode): EmojiNode {
    return new EmojiNode(node.__text, node.__key);
  }

  constructor(text: string, key?: NodeKey) {
    super(text, key);
  }

  createDOM(): HTMLElement {
    const dom = document.createElement('span');
    const inner = document.createElement('span');
    inner.innerHTML = EMOJI_DATA[this.__text];
    inner.className = 'emoji-inner';
    dom.appendChild(inner);
    return dom;
  }

  updateDOM(
    prevNode: TextNode,
    dom: HTMLElement,
    config: EditorConfig,
  ): boolean {
    const inner = dom.firstChild;
    if (inner === null) {
      return true;
    }
    return false;
  }

  static importJSON(serializedNode: SerializedEmojiNode): EmojiNode {
    const node = $createEmojiNode(
      serializedNode.text,
    );
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  exportJSON(): SerializedEmojiNode {
    return {
      ...super.exportJSON(),
      type: 'emoji',
    };
  }

  getTextContent(): string {
    return EMOJI_DATA[this.__text];
  }

}

export function $isEmojiNode(
  node: LexicalNode | null | undefined,
): node is EmojiNode {
  return node instanceof EmojiNode;
}

export function $createEmojiNode(
  emojiText: string,
): EmojiNode {
  const node = new EmojiNode(emojiText).setMode('token');
  return $applyNodeReplacement(node);
}

export const EMOJI: TextMatchTransformer = {
  dependencies: [EmojiNode],
  export: (node: LexicalNode) => {
    if (!$isEmojiNode(node)) { return null }
    return `:${node.__text}:`
  },
  importRegExp: /:([a-z_]*?):/,
  regExp: /:([a-z_]*?):$/,
  replace: (textNode, match: RegExpMatchArray) => {
    const [, text] = match;
    if (EMOJI_DATA[text]) {
      const emojiNode = $createEmojiNode(text);
      textNode.replace(emojiNode);
    }
  },
  trigger: ':',
  type: 'text-match'

}