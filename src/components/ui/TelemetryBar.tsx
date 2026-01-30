import React from 'react';

interface TelemetryBarProps {
  label: string;
  value: number;
  color: string;
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({ label, value, color }) => (
  <div className="mb-3">
    <div className="flex justify-between text-[10px] text-slate-600 mb-1">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
      <div 
        className={`h-full ${color} transition-all duration-500`} 
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);