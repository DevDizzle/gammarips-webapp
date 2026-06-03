// remark (mdast) plugin: turn ticker mentions in report prose into internal
// links to /signals/{ticker}. Constrained to an allow-list (the actual tickers
// in that day's scan) so we never create false-positive links on ordinary
// uppercase words. Cashtags ($AAPL) link at length 1+; bare symbols require
// length >= 2 to avoid matching "A"/"I"/"U.S." etc. Dependency-free manual
// mdast walk so we don't pull in unist-util-visit.

const SKIP_TYPES = new Set(["link", "linkReference", "code", "inlineCode", "definition"]);

export function remarkTickerLinks(options: { tickers: Set<string> }) {
  const tickers = options.tickers;

  function splitText(value: string): any[] | null {
    if (!value) return null;
    const regex = /(\$[A-Za-z]{1,5}|[A-Z]{2,5})\b/g;
    let match: RegExpExecArray | null;
    let last = 0;
    const out: any[] = [];
    let found = false;
    while ((match = regex.exec(value)) !== null) {
      const raw = match[0];
      const sym = raw.replace("$", "").toUpperCase();
      if (!tickers.has(sym)) continue;
      found = true;
      if (match.index > last) {
        out.push({ type: "text", value: value.slice(last, match.index) });
      }
      out.push({
        type: "link",
        url: `/signals/${sym}`,
        children: [{ type: "text", value: raw }],
      });
      last = match.index + raw.length;
    }
    if (!found) return null;
    if (last < value.length) out.push({ type: "text", value: value.slice(last) });
    return out;
  }

  function walk(node: any, parent: any) {
    if (!node || SKIP_TYPES.has(node.type)) return;
    if (node.type === "text" && parent && Array.isArray(parent.children)) {
      const replacement = splitText(node.value);
      if (replacement) {
        const idx = parent.children.indexOf(node);
        if (idx !== -1) parent.children.splice(idx, 1, ...replacement);
      }
      return;
    }
    if (Array.isArray(node.children)) {
      // copy first — splitText mutates parent.children during iteration
      for (const child of node.children.slice()) walk(child, node);
    }
  }

  return (tree: any) => {
    if (tickers.size === 0) return;
    walk(tree, null);
  };
}
