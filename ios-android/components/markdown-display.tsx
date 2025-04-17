import React, { useMemo } from "react";
import {
  Text,
  TouchableWithoutFeedback,
  View,
  Platform,
  StyleSheet,
  Linking,
} from "react-native";
import MarkdownIt from "markdown-it";
import cssToReactNative from "css-to-react-native";
import FitImage from "react-native-fit-image";
import { useVideoPlayer, VideoView } from "expo-video";

// --- Utility Functions and Classes ---

const ImageWithErrorHandling = (props: any) => {
  const [hasError, setHasError] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);

  if (hasError) {
    // Return empty text when image fails to load
    return null;
  }

  return (
    <FitImage
      {...props}
      indicator={!isLoaded}
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
    />
  );
};

const VideoWithErrorHandling = (props: any) => {
  const player = useVideoPlayer(props.source.uri);
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    // Return empty text when video fails to load
    return null;
  }

  return (
    <VideoView
      {...props}
      isLooping={false}
      shouldPlay={false}
      allowsFullscreen={false}
      allowsPictureInPicture={false}
      useNativeControls
      player={player}
      onError={() => setHasError(true)}
    />
  );
};

// Unique ID Generator
let uuid = new Date().getTime();
function getUniqueID(): string {
  uuid++;
  return `rnmr_${uuid.toString(16)}`;
}

// Open URL Handler
function openUrl(url: string, customCallback?: (url: string) => boolean): void {
  if (customCallback) {
    const result = customCallback(url);
    if (url && result && typeof result === "boolean") {
      Linking.openURL(url);
    }
  } else if (url) {
    Linking.openURL(url);
  }
}

// Check Parent Nodes
function hasParents(parents: any[], type: string): boolean {
  return parents.findIndex((el) => el.type === type) > -1;
}

// Token Type Cleaner
const regSelectOpenClose = /_open|_close/g;
function getTokenTypeByToken(token: any): string {
  let cleanedType = "unknown";
  if (token.type) {
    cleanedType = token.type.replace(regSelectOpenClose, "");
  }
  if (cleanedType === "heading") {
    cleanedType = `${cleanedType}${token.tag.substr(1)}`;
  }
  return cleanedType;
}

// Flatten Inline Tokens
function flattenInlineTokens(tokens: any[]): any[] {
  return tokens.reduce((acc, curr) => {
    if (curr.type === "inline" && curr.children && curr.children.length > 0) {
      const children = flattenInlineTokens(curr.children);
      while (children.length) {
        acc.push(children.shift());
      }
    } else {
      acc.push(curr);
    }
    return acc;
  }, []);
}

// Render Inline Tokens as Text
function renderInlineAsText(tokens: any[]): string {
  let result = "";
  for (let i = 0, len = tokens.length; i < len; i++) {
    if (tokens[i].type === "text") {
      result += tokens[i].content;
    } else if (tokens[i].type === "image") {
      result += renderInlineAsText(tokens[i].children);
    }
  }
  return result;
}

// Clean Up Tokens
function cleanupTokens(tokens: any[]): any[] {
  tokens = flattenInlineTokens(tokens);
  tokens.forEach((token) => {
    token.type = getTokenTypeByToken(token);
    if (token.type === "image" || token.type === "hardbreak") {
      token.block = true;
    }
    if (token.type === "image") {
      token.attrs[token.attrIndex("alt")][1] = renderInlineAsText(
        token.children
      );
    }
  });

  const stack: any[] = [];
  return tokens.reduce((acc, token) => {
    if (token.type === "link" && token.nesting === 1) {
      stack.push(token);
    } else if (
      stack.length > 0 &&
      token.type === "link" &&
      token.nesting === -1
    ) {
      if (stack.some((stackToken) => stackToken.block)) {
        stack[0].type = "blocklink";
        stack[0].block = true;
        token.type = "blocklink";
        token.block = true;
      }
      stack.push(token);
      while (stack.length) {
        acc.push(stack.shift());
      }
    } else if (stack.length > 0) {
      stack.push(token);
    } else {
      acc.push(token);
    }
    return acc;
  }, []);
}

// Token Class
class Token {
  type: string;
  nesting: number;
  children: any[] | null;
  block: boolean;

  constructor(
    type: string,
    nesting: number = 0,
    children: any[] | null = null,
    block: boolean = false
  ) {
    this.type = type;
    this.nesting = nesting;
    this.children = children;
    this.block = block;
  }
}

// Group Text Tokens
function groupTextTokens(tokens: any[]): any[] {
  const result: any[] = [];
  let hasGroup = false;

  tokens.forEach((token) => {
    if (!token.block && !hasGroup) {
      hasGroup = true;
      result.push(new Token("textgroup", 1));
      result.push(token);
    } else if (!token.block && hasGroup) {
      result.push(token);
    } else if (token.block && hasGroup) {
      hasGroup = false;
      result.push(new Token("textgroup", -1));
      result.push(token);
    } else {
      result.push(token);
    }
  });

  return result;
}

// Omit List Item Paragraphs
function omitListItemParagraph(tokens: any[]): any[] {
  let depth: number | null = null;
  return tokens.filter((token, index) => {
    if (depth !== null) {
      depth += token.nesting;
    }
    if (token.type === "list_item" && token.nesting === 1 && depth === null) {
      const next = index + 1 in tokens ? tokens[index + 1] : null;
      if (next && next.type === "paragraph" && next.nesting === 1) {
        depth = 0;
        return true;
      }
    } else if (token.type === "paragraph") {
      if (token.nesting === 1 && depth === 1) {
        return false;
      } else if (token.nesting === -1 && depth === 0) {
        depth = null;
        return false;
      }
    }
    return true;
  });
}

// Convert Tokens to AST
function tokensToAST(tokens: any[]): any[] {
  let stack: any[] = [];
  let children: any[] = [];

  if (!tokens || tokens.length === 0) {
    return [];
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const type = getTokenTypeByToken(token);
    const content = token.content;
    let attributes = token.attrs
      ? token.attrs.reduce((prev: any, curr: any) => {
          const [name, value] = curr;
          return { ...prev, [name]: value };
        }, {})
      : {};

    const astNode = {
      type,
      sourceType: token.type,
      sourceInfo: token.info,
      sourceMeta: token.meta,
      block: token.block,
      markup: token.markup,
      key: getUniqueID() + "_" + type,
      content,
      tokenIndex: i,
      index: 0,
      attributes,
      children: tokensToAST(token.children || []),
    };

    if (
      !(
        astNode.type === "text" &&
        astNode.children.length === 0 &&
        astNode.content === ""
      )
    ) {
      astNode.index = children.length;
      if (token.nesting === 1) {
        children.push(astNode);
        stack.push(children);
        children = astNode.children;
      } else if (token.nesting === -1) {
        children = stack.pop() || [];
      } else if (token.nesting === 0) {
        children.push(astNode);
      }
    }
  }

  return children;
}

// Text Style Props
const textStyleProps = [
  "textShadowOffset",
  "color",
  "fontSize",
  "fontStyle",
  "fontWeight",
  "lineHeight",
  "textAlign",
  "textDecorationLine",
  "textShadowColor",
  "fontFamily",
  "textShadowRadius",
  "includeFontPadding",
  "textAlignVertical",
  "fontVariant",
  "letterSpacing",
  "textDecorationColor",
  "textDecorationStyle",
  "textTransform",
  "writingDirection",
];

// Remove Text Style Props
function removeTextStyleProps(style: any): any {
  const obj = { ...style };
  textStyleProps.forEach((prop) => delete obj[prop]);
  return obj;
}

// Convert Additional Styles
function convertAdditionalStyles(style: string): any {
  const rules = style.split(";");
  const tuples = rules
    .map((rule) => {
      let [key, value] = rule.split(":");
      if (key && value) {
        key = key.trim();
        value = value.trim();
        return [key, value] as [string, string];
      }
      return null;
    })
    .filter((x): x is [string, string] => x != null);
  return cssToReactNative(tuples);
}

// AST Renderer Class
class AstRenderer {
  private _renderRules: any;
  private _style: any;
  private _onLinkPress?: (url: string) => boolean;
  private _maxTopLevelChildren?: number | null;
  private _topLevelMaxExceededItem: React.ReactNode;
  private _allowedImageHandlers: string[];
  private _defaultImageHandler: string;
  private _debugPrintTree: boolean;

  constructor(
    renderRules: any,
    style: any,
    onLinkPress?: (url: string) => boolean,
    maxTopLevelChildren?: number | null,
    topLevelMaxExceededItem?: React.ReactNode,
    allowedImageHandlers?: string[],
    defaultImageHandler?: string,
    debugPrintTree: boolean = false
  ) {
    this._renderRules = renderRules;
    this._style = style;
    this._onLinkPress = onLinkPress;
    this._maxTopLevelChildren = maxTopLevelChildren;
    this._topLevelMaxExceededItem = topLevelMaxExceededItem || (
      <Text key="dotdotdot">...</Text>
    );
    this._allowedImageHandlers = allowedImageHandlers || [];
    this._defaultImageHandler = defaultImageHandler || "https://";
    this._debugPrintTree = debugPrintTree;
  }

  getRenderFunction(type: string): any {
    const renderFunction = this._renderRules[type];
    if (!renderFunction) {
      console.warn(`Unknown render rule: ${type}. Using 'unknown' rule.`);
      return this._renderRules.unknown;
    }
    return renderFunction;
  }

  renderNode(
    node: any,
    parentNodes: any[],
    isRoot: boolean = false
  ): React.ReactNode {
    const renderFunction = this.getRenderFunction(node.type);
    const parents = [...parentNodes];
    parents.unshift(node);

    if (this._debugPrintTree) {
      console.log(`${"-".repeat(parents.length - 1)}${node.type}`);
    }

    let children = node.children.map((value: any) =>
      this.renderNode(value, parents)
    );

    if (node.type === "link" || node.type === "blocklink") {
      return renderFunction(
        node,
        children,
        parentNodes,
        this._style,
        this._onLinkPress
      );
    }

    if (node.type === "image") {
      return renderFunction(
        node,
        children,
        parentNodes,
        this._style,
        this._allowedImageHandlers,
        this._defaultImageHandler
      );
    }

    if (children.length === 0 || node.type === "list_item") {
      const styleObj: any = {};
      for (let a = parentNodes.length - 1; a >= 0; a--) {
        let refStyle: any = {};
        if (
          parentNodes[a].attributes?.style &&
          typeof parentNodes[a].attributes.style === "string"
        ) {
          refStyle = convertAdditionalStyles(parentNodes[a].attributes.style);
        }
        if (this._style[parentNodes[a].type]) {
          refStyle = {
            ...refStyle,
            ...StyleSheet.flatten(this._style[parentNodes[a].type]),
          };
          if (parentNodes[a].type === "list_item") {
            let contentStyle =
              parentNodes[a + 1]?.type === "bullet_list"
                ? this._style.bullet_list_content
                : parentNodes[a + 1]?.type === "ordered_list"
                ? this._style.ordered_list_content
                : {};
            refStyle = { ...refStyle, ...StyleSheet.flatten(contentStyle) };
          }
        }
        Object.keys(refStyle).forEach((key) => {
          if (textStyleProps.includes(key)) {
            styleObj[key] = refStyle[key];
          }
        });
      }
      return renderFunction(node, children, parentNodes, this._style, styleObj);
    }

    if (
      isRoot &&
      this._maxTopLevelChildren &&
      children.length > this._maxTopLevelChildren
    ) {
      children = children
        .slice(0, this._maxTopLevelChildren)
        .concat(this._topLevelMaxExceededItem);
    }

    return renderFunction(node, children, parentNodes, this._style);
  }

  render(nodes: any[]): React.ReactNode {
    const root = { type: "body", key: getUniqueID(), children: nodes };
    return this.renderNode(root, [], true);
  }
}

// --- Default Styles ---
const defaultStyles = {
  body: {},
  heading1: { flexDirection: "row" as const, fontSize: 32 },
  heading2: { flexDirection: "row" as const, fontSize: 24 },
  heading3: { flexDirection: "row" as const, fontSize: 18 },
  heading4: { flexDirection: "row" as const, fontSize: 16 },
  heading5: { flexDirection: "row" as const, fontSize: 13 },
  heading6: { flexDirection: "row" as const, fontSize: 11 },
  hr: { backgroundColor: "#000000", height: 1 },
  strong: { fontWeight: "bold" as const },
  em: { fontStyle: "normal" as const },
  s: { textDecorationLine: "line-through" as const },
  blockquote: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  bullet_list: {},
  ordered_list: {},
  list_item: {
    flexDirection: "row" as const,
    justifyContent: "flex-start" as const,
  },
  bullet_list_icon: { marginLeft: 10, marginRight: 10 },
  bullet_list_content: { flex: 1 },
  ordered_list_icon: { marginLeft: 10, marginRight: 10 },
  ordered_list_content: { flex: 1 },
  code_inline: {
    backgroundColor: "transparent",
  },
  code_block: {
    backgroundColor: "transparent",
  },
  fence: {
    backgroundColor: "transparent",
  },
  table: { borderWidth: 1, borderColor: "#000000", borderRadius: 3 },
  thead: {},
  tbody: {},
  th: { flex: 1, padding: 5 },
  tr: {
    borderBottomWidth: 1,
    borderColor: "#000000",
    flexDirection: "row" as const,
  },
  td: { flex: 1, padding: 5 },
  link: { textDecorationLine: "underline" as const },
  blocklink: { flex: 1, borderColor: "#000000", borderBottomWidth: 1 },
  image: {},
  text: {},
  textgroup: {},
  paragraph: {
    marginTop: 10,
    marginBottom: 10,
    flexWrap: "wrap" as const,
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    justifyContent: "flex-start" as const,
    width: "100%",
  },
  hardbreak: { width: "100%", height: 1 },
  softbreak: {},
  pre: {},
  inline: {},
  span: {},
} as const;

// Create a type from the defaultStyles object
type DefaultStylesType = typeof defaultStyles;

// --- Render Rules ---
const defaultRenderRules = {
  unknown: () => null,
  body: (node: any, children: any[], _: any, styles: any) => (
    <View key={node.key} style={styles._VIEW_SAFE_body}>
      {children}
    </View>
  ),
  heading1: (node: any, children: any[], _: any, styles: any) => (
    <View key={node.key} style={styles._VIEW_SAFE_heading1}>
      {children}
    </View>
  ),
  heading2: (node: any, children: any[], _: any, styles: any) => (
    <View key={node.key} style={styles._VIEW_SAFE_heading2}>
      {children}
    </View>
  ),
  heading3: (node: any, children: any[], _: any, styles: any) => (
    <View key={node.key} style={styles._VIEW_SAFE_heading3}>
      {children}
    </View>
  ),
  heading4: (node: any, children: any[], _: any, styles: any) => (
    <View key={node.key} style={styles._VIEW_SAFE_heading4}>
      {children}
    </View>
  ),
  heading5: (node: any, children: any[], _: any, styles: any) => (
    <View key={node.key} style={styles._VIEW_SAFE_heading5}>
      {children}
    </View>
  ),
  heading6: (node: any, children: any[], _: any, styles: any) => (
    <View key={node.key} style={styles._VIEW_SAFE_heading6}>
      {children}
    </View>
  ),
  hr: (node: any, _: any, __: any, styles: any) => (
    <View key={node.key} style={styles._VIEW_SAFE_hr} />
  ),
  strong: (node: any, children: any[], _: any, styles: any) => (
    <Text key={node.key} style={styles.strong}>
      {children}
    </Text>
  ),
  em: (node: any, children: any[], _: any, styles: any) => (
    <Text key={node.key} style={styles.em}>
      {children}
    </Text>
  ),
  s: (node: any, children: any[], _: any, styles: any) => (
    <Text key={node.key} style={styles.s}>
      {children}
    </Text>
  ),
  blockquote: (node: any, children: any[], _: any, styles: any) => (
    <View key={node.key} style={styles._VIEW_SAFE_blockquote}>
      {children}
    </View>
  ),
  bullet_list: (node: any, children: any[], _: any, styles: any) => (
    <View key={node.key} style={styles._VIEW_SAFE_bullet_list}>
      {children}
    </View>
  ),
  ordered_list: (node: any, children: any[], _: any, styles: any) => (
    <View key={node.key} style={styles._VIEW_SAFE_ordered_list}>
      {children}
    </View>
  ),
  list_item: (
    node: any,
    children: any[],
    parent: any[],
    styles: any,
    inheritedStyles = {}
  ) => {
    const refStyle = {
      ...inheritedStyles,
      ...StyleSheet.flatten(styles.list_item),
    };
    const modifiedInheritedStylesObj = Object.keys(refStyle)
      .filter((key) => textStyleProps.includes(key))
      .reduce((obj: any, key) => ({ ...obj, [key]: refStyle[key] }), {});

    if (hasParents(parent, "bullet_list")) {
      return (
        <View key={node.key} style={styles._VIEW_SAFE_list_item}>
          <Text
            style={[modifiedInheritedStylesObj, styles.bullet_list_icon]}
            accessible={false}
          >
            {Platform.select({
              android: "\u2022",
              ios: "\u00B7",
              default: "\u2022",
            })}
          </Text>
          <View style={styles._VIEW_SAFE_bullet_list_content}>{children}</View>
        </View>
      );
    }
    if (hasParents(parent, "ordered_list")) {
      const orderedListIndex = parent.findIndex(
        (el) => el.type === "ordered_list"
      );
      const orderedList = parent[orderedListIndex];
      const listItemNumber =
        (orderedList.attributes?.start || 0) + node.index + 1;
      return (
        <View key={node.key} style={styles._VIEW_SAFE_list_item}>
          <Text style={[modifiedInheritedStylesObj, styles.ordered_list_icon]}>
            {listItemNumber}
            {node.markup}
          </Text>
          <View style={styles._VIEW_SAFE_ordered_list_content}>{children}</View>
        </View>
      );
    }
    return (
      <View key={node.key} style={styles._VIEW_SAFE_list_item}>
        {children}
      </View>
    );
  },
  code_inline: (
    node: any,
    _: any,
    __: any,
    styles: any,
    inheritedStyles = {}
  ) => (
    <Text key={node.key} style={[inheritedStyles, styles.code_inline]}>
      {node.content}
    </Text>
  ),
  code_block: (
    node: any,
    _: any,
    __: any,
    styles: any,
    inheritedStyles = {}
  ) => {
    const content = node.content.endsWith("\n")
      ? node.content.slice(0, -1)
      : node.content;
    return (
      <Text key={node.key} style={[inheritedStyles, styles.code_block]}>
        {content}
      </Text>
    );
  },
  fence: (node: any, _: any, __: any, styles: any, inheritedStyles = {}) => {
    const content = node.content.endsWith("\n")
      ? node.content.slice(0, -1)
      : node.content;
    return (
      <Text key={node.key} style={[inheritedStyles, styles.fence]}>
        {content}
      </Text>
    );
  },
  table: (node: any, children: any[], _: any, styles: any) => (
    <View key={node.key} style={styles._VIEW_SAFE_table}>
      {children}
    </View>
  ),
  thead: (node: any, children: any[], _: any, styles: any) => (
    <View key={node.key} style={styles._VIEW_SAFE_thead}>
      {children}
    </View>
  ),
  tbody: (node: any, children: any[], _: any, styles: any) => (
    <View key={node.key} style={styles._VIEW_SAFE_tbody}>
      {children}
    </View>
  ),
  th: (node: any, children: any[], _: any, styles: any) => (
    <View key={node.key} style={styles._VIEW_SAFE_th}>
      {children}
    </View>
  ),
  tr: (node: any, children: any[], _: any, styles: any) => (
    <View key={node.key} style={styles._VIEW_SAFE_tr}>
      {children}
    </View>
  ),
  td: (node: any, children: any[], _: any, styles: any) => (
    <View key={node.key} style={styles._VIEW_SAFE_td}>
      {children}
    </View>
  ),
  link: (
    node: any,
    children: any[],
    _: any,
    styles: any,
    onLinkPress?: (url: string) => boolean
  ) => (
    <Text
      key={node.key}
      style={styles.link}
      onPress={() => openUrl(node.attributes.href, onLinkPress)}
    >
      {children}
    </Text>
  ),
  blocklink: (
    node: any,
    children: any[],
    _: any,
    styles: any,
    onLinkPress?: (url: string) => boolean
  ) => (
    <TouchableWithoutFeedback
      key={node.key}
      onPress={() => openUrl(node.attributes.href, onLinkPress)}
    >
      <View style={styles.blocklink}>{children}</View>
    </TouchableWithoutFeedback>
  ),
  image: (
    node: any,
    _: any,
    __: any,
    styles: any,
    allowedImageHandlers: string[],
    defaultImageHandler: string
  ) => {
    const { src, alt } = node.attributes;
    const isVideoURL = src.match(
      /\.(mp4|mpeg|mov|quicktime|webm|avi|wmv|flv|3gpp)(\?.*)?$/i
    );

    if (isVideoURL) {
      return (
        <VideoWithErrorHandling
          key={node.key}
          resizeMode="contain"
          source={{ uri: src }}
          style={{
            aspectRatio: 1,
            minHeight: 200,
            maxHeight: 450,
            height: "auto",
            width: "100%",
          }}
        />
      );
    }

    const show = allowedImageHandlers.some((handler) =>
      src.toLowerCase().startsWith(handler.toLowerCase())
    );
    if (!show && !defaultImageHandler) return null;

    return (
      <ImageWithErrorHandling
        key={node.key}
        style={{
          ...styles._VIEW_SAFE_image,
          aspectRatio: 1,
          minHeight: 200,
          maxHeight: 450,
          height: "auto",
          width: "100%",
        }}
        imageStyle={{
          borderRadius: 8,
        }}
        source={{ uri: show ? src : `${defaultImageHandler}${src}` }}
        accessible={!!alt}
        accessibilityLabel={alt}
      />
    );
  },
  text: (node: any, _: any, __: any, styles: any, inheritedStyles = {}) => (
    <Text key={node.key} style={[inheritedStyles, styles.text]}>
      {node.content}
    </Text>
  ),
  textgroup: (node: any, children: any[], _: any, styles: any) => (
    <Text key={node.key} style={styles.textgroup}>
      {children}
    </Text>
  ),
  paragraph: (node: any, children: any[], _: any, styles: any) => (
    <View key={node.key} style={styles._VIEW_SAFE_paragraph}>
      {children}
    </View>
  ),
  hardbreak: (node: any, _: any, __: any, styles: any) => (
    <Text key={node.key} style={styles.hardbreak}>
      {"\n"}
    </Text>
  ),
  softbreak: (node: any, _: any, __: any, styles: any) => (
    <Text key={node.key} style={styles.softbreak}>
      {"\n"}
    </Text>
  ),
  pre: (node: any, children: any[], _: any, styles: any) => (
    <View key={node.key} style={styles._VIEW_SAFE_pre}>
      {children}
    </View>
  ),
  inline: (node: any, children: any[], _: any, styles: any) => (
    <Text key={node.key} style={styles.inline}>
      {children}
    </Text>
  ),
  span: (node: any, children: any[], _: any, styles: any) => (
    <Text key={node.key} style={styles.span}>
      {children}
    </Text>
  ),
};

// --- Component Props Interface ---
interface MarkdownDisplayProps {
  children: string | any[];
  rules?: any;
  style?: Partial<DefaultStylesType> | any;
  mergeStyle?: boolean;
  markdownit?: MarkdownIt;
  onLinkPress?: (url: string) => boolean;
  maxTopLevelChildren?: number;
  topLevelMaxExceededItem?: React.ReactNode;
  allowedImageHandlers?: string[];
  defaultImageHandler?: string;
  debugPrintTree?: boolean;
}

// --- MarkdownDisplay Component ---
const MarkdownDisplay: React.FC<MarkdownDisplayProps> = ({
  children,
  rules = {},
  style = null,
  mergeStyle = true,
  markdownit = MarkdownIt({
    typographer: true,
    breaks: true,
  }),
  onLinkPress,
  maxTopLevelChildren = null,
  topLevelMaxExceededItem = <Text key="dotdotdot">...</Text>,
  allowedImageHandlers = [
    "data:image/png;base64",
    "data:image/gif;base64",
    "data:image/jpeg;base64",
    "https://",
    "http://",
  ],
  defaultImageHandler = "https://",
  debugPrintTree = false,
}) => {
  // Memoized Styles
  const useStyles = useMemo(() => {
    let stylesToUse: Record<string, any> = {};
    if (mergeStyle && style) {
      Object.keys(defaultStyles).forEach((key) => {
        const styleKey = key as keyof typeof defaultStyles;
        stylesToUse[styleKey] = {
          ...defaultStyles[styleKey],
          ...(style[styleKey] ? StyleSheet.flatten(style[styleKey]) : {}),
        };
      });

      if (style) {
        // Handle any additional styles not in defaultStyles
        Object.keys(style).forEach((key) => {
          if (!(key in defaultStyles)) {
            stylesToUse[key] = StyleSheet.flatten(style[key]);
          }
        });
      }
    } else {
      stylesToUse = { ...defaultStyles };
      if (style) {
        Object.keys(style).forEach((key) => {
          stylesToUse[key] = StyleSheet.flatten(style[key]);
        });
      }
    }

    // Add view-safe styles
    Object.keys(stylesToUse).forEach((key) => {
      stylesToUse[`_VIEW_SAFE_${key}`] = removeTextStyleProps(stylesToUse[key]);
    });

    return StyleSheet.create(stylesToUse);
  }, [style, mergeStyle]);

  // Memoized Renderer
  const renderer = useMemo(
    () =>
      new AstRenderer(
        { ...defaultRenderRules, ...rules },
        useStyles,
        onLinkPress,
        maxTopLevelChildren,
        topLevelMaxExceededItem,
        allowedImageHandlers,
        defaultImageHandler,
        debugPrintTree
      ),
    [
      rules,
      useStyles,
      onLinkPress,
      maxTopLevelChildren,
      topLevelMaxExceededItem,
      allowedImageHandlers,
      defaultImageHandler,
      debugPrintTree,
    ]
  );

  // Memoized AST
  const ast = useMemo(() => {
    if (Array.isArray(children)) {
      return children;
    } else if (typeof children === "string") {
      const tokens = (() => {
        let result: any[] = [];
        try {
          result = markdownit.parse(children, {});
        } catch (err) {
          console.warn(err);
        }
        return result;
      })();
      const cleanedTokens = cleanupTokens(tokens);
      const groupedTokens = groupTextTokens(cleanedTokens);
      const omittedTokens = omitListItemParagraph(groupedTokens);
      return tokensToAST(omittedTokens);
    }
    console.warn(
      "MarkdownDisplay: children must be a string or an array of AST nodes"
    );
    return [];
  }, [children, markdownit]);

  return renderer.render(ast);
};

export default MarkdownDisplay;
