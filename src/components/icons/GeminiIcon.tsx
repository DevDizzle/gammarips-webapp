import React from 'react';

export const GeminiIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
    <path d="M17.5 17.5a8.5 8.5 0 0 1-11 0" />
    <path d="M6.5 17.5a8.5 8.5 0 0 0 11 0" />
    <path d="m17.2 7-10.4 10.4" />
  </svg>
);
