import React from "react";

export const RibbonGroup: React.FC<{
  children?: React.ReactNode;
  label?: string;
}> = ({ children, label }) => {
  return (
    <div className="flex items-center gap-1 px-2 h-full border-r border-slate-200 last:border-r-0">
      {children}
      {label ? (
        <span className="ml-2 hidden text-[10px] text-slate-500">{label}</span>
      ) : null}
    </div>
  );
};

export default RibbonGroup;
