import React from "react";
import { Button } from "@blueprintjs/core";
import type { ButtonProps } from "@blueprintjs/core"; // test

export type BPButtonProps = ButtonProps & { compact?: boolean };

export const BPButton = React.forwardRef<HTMLButtonElement, BPButtonProps>(
  (props, ref) => {
    const { compact, className, ...rest } = props;
    const classes = ["app-btn", className || "", compact ? "bp-compact" : ""]
      .filter(Boolean)
      .join(" ");
    return (
      <Button ref={ref as any} className={classes} {...(rest as ButtonProps)} />
    );
  },
);

BPButton.displayName = "BPButton";

export default BPButton;
