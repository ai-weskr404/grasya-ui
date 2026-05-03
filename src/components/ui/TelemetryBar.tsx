import React from "react";
import { ProgressBar } from "@blueprintjs/core";

interface TelemetryBarProps {
  label: string;
  value: number;
  color: string;
}

const colorToIntent = (color: string) => {
  if (color.includes("green")) return "success" as const;
  if (color.includes("red")) return "danger" as const;
  if (color.includes("orange") || color.includes("amber"))
    return "warning" as const;
  return "primary" as const;
};

export const TelemetryBar: React.FC<TelemetryBarProps> = ({
  label,
  value,
  color,
}) => (
  <div className="mb-3">
    <div className="flex justify-between text-[10px] text-slate-600 mb-1">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <ProgressBar
      value={Math.max(0, Math.min(100, value)) / 100}
      intent={colorToIntent(color)}
      stripes={false}
      animate={false}
    />
  </div>
);
