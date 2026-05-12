import React from "react";
import { InputGroup } from "@blueprintjs/core";
import type { InputGroupProps } from "@blueprintjs/core"; // test

export const BPInput: React.FC<InputGroupProps> = (props) => {
  return <InputGroup {...props} />;
};

export default BPInput;
