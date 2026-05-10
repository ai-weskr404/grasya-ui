import React from "react";
import { Button, Tooltip } from "@blueprintjs/core";
import type { ButtonProps } from "@blueprintjs/core"; // test

// export interface BPIconButtonProps extends Omit<ButtonProps, "icon"> {
//   icon: any; // IconName or JSX
//   title?: React.ReactNode;
// }

export interface BPIconButtonProps extends Omit<ButtonProps, "icon" | "title"> {
  icon: any;
  title?: string | JSX.Element;
}

export const BPIconButton: React.FC<BPIconButtonProps> = ({
  icon,
  title,
  ...rest
}) => {
  const button = (
    <Button icon={icon as any} minimal small {...(rest as ButtonProps)} />
  );
  return title ? <Tooltip content={title}>{button}</Tooltip> : button;
};

export default BPIconButton;
