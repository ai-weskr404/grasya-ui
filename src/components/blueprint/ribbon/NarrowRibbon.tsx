import React from "react";

export const NarrowRibbon: React.FC<{
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div
      className={`w-full h-9 bg-slate-100 flex items-center gap-1 px-2 ${className || ""}`}
    >
      {children}
    </div>
  );
};

export default NarrowRibbon;
