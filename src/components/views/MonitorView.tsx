import React, { useRef, useEffect } from 'react';
import { Database, UploadCloud, Cloud, Server } from 'lucide-react';
import type{ LogEntry } from '../../types';

interface MonitorViewProps {
  logs: LogEntry[];
  isRunning: boolean;
  isAwsEnabled: boolean;
  trafficState?: 'BLUE_POSTGRES' | 'GREEN_MONGO';
}

export const MonitorView: React.FC<MonitorViewProps> = ({
  logs,
  isRunning,
  isAwsEnabled,
  trafficState = 'BLUE_POSTGRES'
}) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col h-full">
      {/* Diagram Section */}
      <div className="p-4 border-b border-slate-300">
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-sm flex items-center justify-between relative overflow-hidden gap-2">
          {/* BG Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '10px 10px' }} />

          {/* 1. Source PG */}
          <div className="relative flex flex-col items-center gap-2 z-10 w-24">
            <div className={`
                w-12 h-12 bg-white border shadow-sm rounded flex items-center justify-center transition-all duration-500
                ${trafficState === 'BLUE_POSTGRES'
                  ? 'border-blue-500 ring-4 ring-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105'
                  : 'border-slate-300 opacity-60 grayscale-[0.5]'
                }
              `}>
                <Database className={trafficState === 'BLUE_POSTGRES' ? "text-blue-600" : "text-slate-400"} size={20} />
            </div>
            <div className="text-center">
                <div className={`text-[10px] font-bold ${trafficState === 'BLUE_POSTGRES' ? "text-blue-700" : "text-slate-500"}`}>
                  PostgreSQL
                </div>
                <div className="text-[9px] text-slate-400">Source</div>
            </div>
          </div>

          {/* Arrow 1 */}
          <div className="flex items-center gap-1 flex-1 justify-center z-10">
            <div className={`h-1 flex-1 bg-slate-300 rounded relative overflow-hidden`}>
                {isRunning && <div className="absolute inset-0 bg-blue-400 animate-progress-indeterminate" />}
            </div>
          </div>

          {/* NEW: KAFKA NODE (The "Central Nervous System") */}
          <div className="flex flex-col items-center gap-2 z-10 w-24">
            <div className="w-12 h-12 bg-white border border-slate-300 shadow-sm rounded flex items-center justify-center">
                <Server className="text-purple-600" size={20} />
            </div>
            <div className="text-center">
                <div className="text-[10px] font-bold text-slate-700">Kafka</div>
                <div className="text-[9px] text-slate-500">Event Bus</div>
            </div>
          </div>

          {/* 2. Target Mongo */}
          <div className="relative flex flex-col items-center gap-2 z-10 w-24">
            <div className={`
                  w-12 h-12 bg-white border shadow-sm rounded flex items-center justify-center relative transition-all duration-500
                  ${trafficState === 'GREEN_MONGO'
                    ? 'border-green-500 ring-4 ring-green-100 shadow-[0_0_15px_rgba(34,197,94,0.5)] scale-105'
                    : 'border-slate-300'
                  }
                `}>
                <Database className={trafficState === 'GREEN_MONGO' ? "text-green-600" : "text-slate-400"} size={20} />
                <div className={`
                   absolute -bottom-1 -right-1 text-[8px] px-1 rounded border transition-colors duration-500
                   ${trafficState === 'GREEN_MONGO'
                     ? 'bg-green-100 text-green-700 border-green-200'
                     : 'bg-slate-100 text-slate-400 border-slate-200'
                   }
                `}>NoSQL</div>
            </div>
            <div className="text-center">
                <div className={`text-[10px] font-bold ${trafficState === 'GREEN_MONGO' ? "text-green-700" : "text-slate-500"}`}>
                  MongoDB
                </div>
                <div className="text-[9px] text-slate-400">Transform</div>
            </div>
          </div>

          {/* Arrow 2 (AWS Link) */}
          <div className="flex items-center gap-1 flex-1 justify-center z-10">
            <div className={`h-1 flex-1 bg-slate-300 rounded relative overflow-hidden`}>
                {isRunning && isAwsEnabled && <div className="absolute inset-0 bg-orange-400 animate-progress-indeterminate" style={{ animationDelay: '0.5s' }} />}
            </div>
            {isAwsEnabled && <UploadCloud size={14} className="text-slate-400" />}
            <div className={`h-1 flex-1 bg-slate-300 rounded relative overflow-hidden`}>
                {isRunning && isAwsEnabled && <div className="absolute inset-0 bg-orange-400 animate-progress-indeterminate" style={{ animationDelay: '0.7s' }} />}
            </div>
          </div>

          {/* 3. AWS Cloud */}
          <div className={`flex flex-col items-center gap-2 z-10 w-24 ${!isAwsEnabled ? 'opacity-30 grayscale' : ''}`}>
            <div className="w-12 h-12 bg-white border border-slate-300 shadow-sm rounded flex items-center justify-center">
                <Cloud className="text-orange-500" size={20} />
            </div>
            <div className="text-center">
                <div className="text-[10px] font-bold text-slate-700">AWS S3</div>
                <div className="text-[9px] text-slate-500">Archive</div>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Section */}
      <div className="flex-1 flex flex-col min-h-0">
          <div className="flex bg-slate-100 border-b border-slate-300 h-7 items-center px-2 gap-4 shrink-0">
            <button className="text-[11px] font-bold text-slate-800 border-b-2 border-orange-500 h-full px-1">Migration Logs</button>
            <button className="text-[11px] font-medium text-slate-500 hover:text-slate-800 h-full px-1">AWS Events</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 font-mono text-[11px] leading-relaxed bg-white">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-3 border-b border-slate-50 last:border-0 hover:bg-slate-50">
              <span className="text-slate-400 select-none min-w-[60px]">{log.timestamp}</span>
              <span className={`
                ${log.type === 'error' ? 'text-red-600' : ''}
                ${log.type === 'warning' ? 'text-amber-600' : ''}
                ${log.type === 'success' ? 'text-green-700' : ''}
                ${log.type === 'info' ? 'text-slate-800' : ''}
              `}>
                {log.type === 'error' && '[ERR] '}
                {log.message}
              </span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
};