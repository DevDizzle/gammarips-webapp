import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import rehypeRaw from "rehype-raw";

type MarkdownProps = {
  content: string;
  className?: string;
};

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <ReactMarkdown
      className={cn("prose prose-invert text-sm break-words", className)}
      rehypePlugins={[rehypeRaw]}
      components={{
        h1: (props) => <h1 className="text-xl font-bold mb-2" {...props} />,
        h2: (props) => <h2 className="text-lg font-semibold mb-2" {...props} />,
        h3: (props) => <h3 className="text-base font-semibold mb-1" {...props} />,
        p: (props) => <p className="mb-2 last:mb-0" {...props} />,
        ul: (props) => <ul className="list-disc pl-5 space-y-1" {...props} />,
        ol: (props) => <ol className="list-decimal pl-5 space-y-1" {...props} />,
        li: (props) => <li className="mb-1" {...props} />,
        a: (props) => (
          <a className="text-primary font-medium hover:underline" {...props} />
        ),
        strong: (props) => <strong className="font-bold" {...props} />,
        code: (props) => (
          <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono" {...props} />
        ),
        blockquote: (props) => (
          <blockquote
            className="border-l-2 border-muted pl-3 italic text-muted-foreground"
            {...props}
          />
        ),
        // By removing the custom img renderer, we let rehype-raw handle it.
        // It will correctly render raw <img> tags with all their attributes.
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
