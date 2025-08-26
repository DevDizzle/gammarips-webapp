// src/components/markdown.tsx
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import rehypeRaw from "rehype-raw";

type MarkdownProps = { content: string; className?: string };

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <ReactMarkdown
      className={cn("prose prose-invert text-sm break-words", className)}
      rehypePlugins={[rehypeRaw]}
      skipHtml={false}
      // Let data:/blob: URLs through (instead of being sanitized to "")
      urlTransform={(url, key) => {
        if (typeof url !== "string") return url as any;
        if (url.startsWith("data:") || url.startsWith("blob:")) return url;
        return url; // keep default for http/https
      }}
      components={{
        img: ({ node, ...props }) => {
          const propsSrc = (props as any).src;
          const nodeSrc = (node as any)?.properties?.src;
          const src = (typeof propsSrc === "string" ? propsSrc : nodeSrc)?.trim() || "";
          if (!src) return null; // never render empty src (kills the warning)

          const alt = (props as any).alt ?? (node as any)?.properties?.alt ?? "";
          return (
            <img
              src={src}
              alt={alt}
              loading="lazy"
              decoding="async"
              className="max-w-full h-auto block m-0"
              onError={(e) => {
                // hide broken images quietly
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
