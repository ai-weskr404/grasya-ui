import React from "react";
import { TextArea } from "@blueprintjs/core";
import type { TextAreaProps } from "@blueprintjs/core"; // test

export const BPTextArea: React.FC<TextAreaProps> = (props) => {
  return <TextArea {...props} />;
};

export default BPTextArea;
