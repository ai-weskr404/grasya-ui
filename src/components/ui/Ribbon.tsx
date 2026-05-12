import React from "react";
import BPPrimaryButton from "../blueprint/wrappers/BPPrimaryButton";
import BPIconButton from "../blueprint/wrappers/BPIconButton";

// test only
type RibbonVtnVariant = "small" | "default" | "large";

interface RibbonGroupProps {
  label: string;
  children: React.ReactNode;
}

export const RibbonGroup: React.FC<RibbonGroupProps> = ({
  label,
  children,
}) => (
  <div className="flex items-center h-full px-2 border-r border-slate-300 last:border-r-0">
    <div className="flex items-center gap-1">{children}</div>
    {/* Visual labels removed for compact ribbon; keep for screen readers */}
    <span className="sr-only">{label}</span>
  </div>
);

interface RibbonBtnProps {
  icon: any;
  label?: string;
  primary?: boolean; // show inline label for primary actions
  onClick?: () => void;
  active?: boolean;
  color?: string;
  variant?: RibbonVtnVariant; // test only
}

export const RibbonBtn: React.FC<RibbonBtnProps> = ({
  icon,
  label,
  primary = false,
  onClick,
  active = false,
  variant = "default",
}) => {
  if (primary) {
    return (
      <BPPrimaryButton icon={icon} label={label || ""} onClick={onClick} />
    );
  }

  return <BPIconButton icon={icon} title={label} onClick={onClick} />;
};

export default RibbonBtn;
