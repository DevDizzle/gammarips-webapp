
'use client';

import React, { useState, useEffect } from 'react';
import { Link as LinkIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { XIcon } from '@/components/icons/XIcon';

interface ShareButtonsProps {
  title: string;
}

// Inline SVG for the Reddit icon as it's not available in lucide-react
const RedditIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current">
        <title>Reddit</title>
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.35 13.91c-.55.55-1.44.87-2.32.87-.88 0-1.61-.23-2.16-.58a.8.8 0 0 0-1.18.79v1.94c0 .44-.36.8-.8.8h-1.8c-.44 0-.8-.36-.8-.8v-1.94a.8.8 0 0 0-1.18-.79c-.55.35-1.28.58-2.16.58-.88 0-1.77-.32-2.32-.87-.55-.55-.87-1.44-.87-2.32 0-.88.32-1.77.87-2.32.55-.55 1.44-.87 2.32-.87.88 0 1.61.23 2.16.58a.8.8 0 0 0 1.18-.79V6.2a.8.8 0 0 0-.8-.8h-1.8c-.44 0-.8.36-.8.8v1.94c0 .44-.36.8-.8.8s-.8-.36-.8-.8V6.2a.8.8 0 0 0-.8-.8H7.1a.8.8 0 0 0-.8.8v1.94c0 .44-.36.8-.8.8s-.8-.36-.8-.8V6.2c0-.44-.36-.8-.8-.8H2.9c-.44 0-.8.36-.8.8v1.94c0 .44-.36.8-.8.8s-.8-.36-.8-.8V6.2a.8.8 0 0 0-.8-.8h-2.3c-.44 0-.8.36-.8.8v1.94c0 .44-.36.8-.8.8s-.8-.36-.8-.8V6.2c0-1.33 1.07-2.4 2.4-2.4h11.2c1.33 0 2.4 1.07 2.4 2.4v1.94c0 .44-.36.8-.8.8s-.8-.36-.8-.8V6.2a.8.8 0 0 0-.8-.8h-1.8c-.44 0-.8.36-.8.8v1.94a.8.8 0 0 0 1.18.79c.55-.35 1.28-.58 2.16-.58.88 0 1.77.32 2.32.87.55.55.87 1.44.87 2.32 0 .88-.32 1.77-.87 2.32z"/>
    </svg>
);


export function ShareButtons({ title }: ShareButtonsProps) {
  const [currentUrl, setCurrentUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    // This ensures that window.location is only accessed on the client-side
    setCurrentUrl(window.location.href);
  }, []);

  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(currentUrl);

  const xShareUrl = `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  const redditShareUrl = `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;

  const copyToClipboard = () => {
    if (!currentUrl) return;
    navigator.clipboard.writeText(currentUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    });
  };

  if (!currentUrl) {
    // Don't render anything on the server or before hydration
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground mr-2">Share:</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <a href={xShareUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon">
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Share on X</span>
              </Button>
            </a>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share on X</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <a href={redditShareUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon">
                <RedditIcon />
                <span className="sr-only">Share on Reddit</span>
              </Button>
            </a>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share on Reddit</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={copyToClipboard}>
              {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <LinkIcon className="h-4 w-4" />}
              <span className="sr-only">Copy link</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isCopied ? 'Copied!' : 'Copy link'}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
