import React from "react";
import { Button } from "@blueprintjs/core";

export const BPPrimaryButton: React.FC<{
  icon?: any;
  label: string;
  onClick?: () => void;
  small?: boolean;
}> = ({ icon, label, onClick, small = true }) => {
  return (
    <Button icon={icon as any} intent="primary" small={small} onClick={onClick}>
      {label}
    </Button>
  );
};

export default BPPrimaryButton;
