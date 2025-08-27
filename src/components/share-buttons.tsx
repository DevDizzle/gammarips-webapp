
'use client';

import React, { useState, useEffect } from 'react';
import { Twitter, Reddit, Link as LinkIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ShareButtonsProps {
  title: string;
}

export function ShareButtons({ title }: ShareButtonsProps) {
  const [currentUrl, setCurrentUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    // This ensures that window.location is only accessed on the client-side
    setCurrentUrl(window.location.href);
  }, []);

  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(currentUrl);

  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
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
            <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon">
                <Twitter className="h-4 w-4" />
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
                <Reddit className="h-4 w-4" />
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
