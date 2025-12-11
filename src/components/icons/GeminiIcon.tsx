import React from 'react';

// Define props extending standard SVG attributes for maximum flexibility
// allowing things like onClick, className, aria-labels, etc.
interface GeminiIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

const GeminiIcon: React.FC<GeminiIconProps> = ({
  size = 24, // Default size
  className = '',
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      // Using currentColor allows controlling color via CSS text-color
      color="currentColor"
      className={className}
      {...props}
    >
      <path
        d="M12 24C12 24 8.85214 15.1479 0 12C8.85214 8.85214 12 0 12 0C12 0 15.1479 8.85214 24 12C15.1479 15.1479 12 24 12 24Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default GeminiIcon;
