import React from "react";
import { HTMLSelect } from "@blueprintjs/core";
import type { HTMLSelectProps } from "@blueprintjs/core"; // test

export const BPSelect: React.FC<HTMLSelectProps> = (props) => {
  return <HTMLSelect {...props} />;
};

export default BPSelect;
