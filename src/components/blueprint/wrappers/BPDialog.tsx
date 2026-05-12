import React from "react";
import { Dialog } from "@blueprintjs/core";
import type { DialogProps } from "@blueprintjs/core"; // test

export const BPDialog: React.FC<DialogProps> = (props) => {
  return <Dialog {...props} />;
};

export default BPDialog;
