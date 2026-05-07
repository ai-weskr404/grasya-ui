import React from "react";

interface DatabaseIconProps {
  className?: string;
  size?: number;
}

export const DatabaseIcon: React.FC<DatabaseIconProps> = ({
  className,
  size = 16,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={{ width: size, height: size }}
    aria-hidden="true"
  >
    <path d="M12 3C7.58 3 4 4.34 4 6v12c0 1.66 3.58 3 8 3s8-1.34 8-3V6c0-1.66-3.58-3-8-3Zm0 2c3.87 0 6 .99 6 1s-2.13 1-6 1-6-.99-6-1 2.13-1 6-1Zm0 14c-3.87 0-6-.99-6-1v-2.23c1.29.77 3.49 1.23 6 1.23s4.71-.46 6-1.23V18c0 .01-2.13 1-6 1Zm0-5c-3.87 0-6-.99-6-1v-2.23C7.29 11.54 9.49 12 12 12s4.71-.46 6-1.23V13c0 .01-2.13 1-6 1Z" />
  </svg>
);
