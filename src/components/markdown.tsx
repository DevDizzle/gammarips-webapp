'use client';

import React from 'react';

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={`prose prose-invert max-w-none ${className || ''}`}>
      <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />
    </div>
  );
}
