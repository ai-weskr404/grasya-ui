import React from "react";
import { Button } from "@blueprintjs/core";

export const BPPrimaryButton: React.FC<{
  icon?: any;
  label: string;
  onClick?: () => void;
  className?: string;
}> = ({ icon, label, onClick, className }) => {
  return (
    <Button icon={icon as any} intent="primary" className={["app-btn", className || ""].filter(Boolean).join(" ")} onClick={onClick}>
      {label}
    </Button>
  );
};

export default BPPrimaryButton;
