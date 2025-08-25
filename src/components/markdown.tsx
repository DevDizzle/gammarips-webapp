// src/components/markdown.tsx
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import rehypeRaw from "rehype-raw";

export function Markdown({ content, className }: { content: string; className?: string }) {
  return (
    <ReactMarkdown
      className={cn("prose prose-invert text-sm break-words", className)}
      rehypePlugins={[rehypeRaw]}
    >
      {content}
    </ReactMarkdown>
  );
}
