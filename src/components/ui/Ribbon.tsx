import React from "react";

interface RibbonGroupProps {
  label: string;
  children: React.ReactNode;
}

export const RibbonGroup: React.FC<RibbonGroupProps> = ({
  label,
  children,
}) => (
  <div className="flex flex-col h-full px-2 border-r border-slate-300 last:border-r-0">
    <div className="flex flex-1 items-start gap-1 justify-center min-w-[60px]">
      {children}
    </div>
    <div className="text-[10px] text-slate-500 text-center uppercase tracking-wider mt-1 select-none">
      {label}
    </div>
  </div>
);

interface RibbonBtnProps {
  icon: any;
  label: string;
  variant?: "large" | "small";
  onClick?: () => void;
  active?: boolean;
  color?: string;
}

export const RibbonBtn: React.FC<RibbonBtnProps> = ({
  icon: Icon,
  label,
  variant = "large",
  onClick,
  active = false,
  color = "text-slate-700",
}) => {
  if (variant === "large") {
    return (
      <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center h-[64px] min-w-[50px] px-2 rounded-sm hover:bg-slate-200 active:bg-slate-300 transition-colors ${active ? "bg-blue-100 border border-blue-300" : ""}`}
      >
        <Icon className={`w-6 h-6 mb-1 ${color}`} strokeWidth={1.5} />
        <span className="text-[11px] leading-tight text-center text-slate-700">
          {label}
        </span>
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-2 py-1 rounded-sm hover:bg-slate-200 text-left gap-2 ${active ? "bg-blue-100" : ""}`}
    >
      <Icon className={`w-4 h-4 ${color}`} strokeWidth={1.5} />
      <span className="text-[11px] text-slate-700">{label}</span>
    </button>
  );
};
