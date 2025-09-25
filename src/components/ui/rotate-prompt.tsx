
'use client';

import { useState, useEffect } from 'react';
import { Smartphone } from 'lucide-react';

export function RotatePrompt() {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check for mobile user agent
      const isMobileDevice = /Mobi/i.test(window.navigator.userAgent);
      setIsMobile(isMobileDevice);

      // Check for portrait orientation
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);

    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  if (!isMobile || !isPortrait) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg p-4 text-center pointer-events-none">
        <div className="flex items-center gap-2 animate-pulse">
            <Smartphone className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-semibold text-muted-foreground">Rotate for a better view</p>
        </div>
    </div>
  );
}
