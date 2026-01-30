import React from 'react';
import { X, Server, Database, Cloud } from 'lucide-react';

interface ConnectionDialogProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isAwsEnabled: boolean;
  setIsAwsEnabled: (val: boolean) => void;
}

export const ConnectionDialog: React.FC<ConnectionDialogProps> = ({
  show, onClose, onConfirm, isAwsEnabled, setIsAwsEnabled
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-[1px]">
      <div className="w-[500px] bg-slate-100 border border-slate-400 shadow-2xl shadow-black/30 flex flex-col font-sans text-xs select-none">
        
        {/* Header */}
        <div className="h-8 bg-white flex items-center justify-between px-3 border-b border-slate-300">
           <div className="flex items-center gap-2">
             <Server size={14} className="text-slate-600"/>
             <span className="font-semibold text-slate-700">Connect to Server</span>
           </div>
           <X size={16} className="cursor-pointer text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded" onClick={onClose}/>
        </div>
        
        {/* Body */}
        <div className="p-4 bg-slate-100 flex flex-col gap-3">
           {/* Branding */}
           <div className="flex items-center gap-3 pb-3 border-b border-slate-300/60">
              <div className="w-10 h-10 bg-slate-200 rounded-sm border border-slate-300 flex items-center justify-center">
                <Database size={24} className="text-slate-500" strokeWidth={1.5} />
              </div>
              <div>
                 <h2 className="text-lg font-light text-slate-700 tracking-tight">G.R.A.S.Y.A.</h2>
                 <p className="text-slate-500 text-[11px]">Database Migration Engine v2.0</p>
              </div>
           </div>

           {/* Source */}
           <fieldset className="border border-slate-300 p-2 rounded-sm bg-white relative">
              <legend className="px-1 text-slate-500 font-semibold text-[11px] ml-1 bg-white">1. Source: PostgreSQL</legend>
              <div className="grid grid-cols-[80px_1fr] gap-2 items-center text-[11px]">
                 <label className="text-right text-slate-600">Server:</label>
                 <input type="text" className="border border-slate-300 p-1 w-full focus:border-blue-500 outline-none h-6" defaultValue="192.168.1.10" />
                 
                 <label className="text-right text-slate-600">Login:</label>
                 <input type="text" className="border border-slate-300 p-1 w-full focus:border-blue-500 outline-none h-6" defaultValue="postgres" />
              </div>
           </fieldset>

           {/* Target */}
           <fieldset className="border border-slate-300 p-2 rounded-sm bg-white">
              <legend className="px-1 text-slate-500 font-semibold text-[11px] ml-1 bg-white">2. Target: MongoDB</legend>
              <div className="grid grid-cols-[80px_1fr] gap-2 items-center text-[11px]">
                 <label className="text-right text-slate-600">Conn String:</label>
                 <div className="flex gap-1">
                    <input type="password" className="border border-slate-300 p-1 w-full focus:border-blue-500 outline-none h-6 bg-slate-50 text-slate-500" defaultValue="mongodb+srv://cluster0.example.net" readOnly />
                    <button className="border border-slate-300 bg-slate-100 px-2 hover:bg-slate-200 text-slate-600 h-6">...</button>
                 </div>
              </div>
           </fieldset>

           {/* Cloud */}
           <fieldset className={`border ${isAwsEnabled ? 'border-orange-300 bg-orange-50/10' : 'border-slate-300'} p-2 rounded-sm bg-white transition-colors`}>
              <legend className="px-1 text-slate-500 font-semibold text-[11px] ml-1 bg-white flex items-center gap-2">
                 <input type="checkbox" checked={isAwsEnabled} onChange={(e) => setIsAwsEnabled(e.target.checked)} className="accent-orange-500 cursor-pointer"/>
                 3. Cloud Replication (AWS)
              </legend>
              
              {isAwsEnabled ? (
                  <div className="grid grid-cols-[80px_1fr] gap-2 items-center text-[11px]">
                    <label className="text-right text-slate-600">Region:</label>
                    <select className="border border-slate-300 p-1 w-full bg-slate-50 focus:border-orange-500 outline-none h-6">
                        <option>us-east-1 (N. Virginia)</option>
                        <option>ap-southeast-1 (Singapore)</option>
                    </select>
                    
                    <label className="text-right text-slate-600">S3 Bucket:</label>
                    <input type="text" className="border border-slate-300 p-1 w-full focus:border-orange-500 outline-none h-6" defaultValue="grasya-datalake-v2" />
                  </div>
              ) : (
                  <div className="text-center text-slate-400 italic py-1">Cloud replication disabled</div>
              )}
           </fieldset>
        </div>

        {/* Footer */}
        <div className="h-12 bg-slate-200 border-t border-slate-300 flex items-center justify-end px-3 gap-2">
           <button 
              className="px-6 py-1 bg-white border border-slate-400 hover:bg-slate-50 hover:border-blue-400 rounded-sm min-w-[80px] text-slate-700" 
              onClick={onClose}
           >
             Cancel
           </button>
           <button 
              className="px-6 py-1 bg-slate-100 border border-slate-400 hover:bg-blue-50 hover:border-blue-400 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5)] text-slate-800 rounded-sm min-w-[80px] font-medium active:translate-y-[1px]" 
              onClick={onConfirm}
           >
             Connect
           </button>
        </div>
      </div>
    </div>
  );
};