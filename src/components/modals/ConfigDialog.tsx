import React, { useState } from "react";
import { Settings, Save, X } from "lucide-react";

interface ConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConfigDialog: React.FC<ConfigDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeConfigTab, setActiveConfigTab] = useState<
    "runtime" | "network" | "mapping"
  >("runtime");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/35 z-50 flex items-center justify-center">
      <div className="w-[860px] h-[560px] bg-slate-100 border border-slate-400 shadow-xl rounded-sm flex flex-col font-sans select-none overflow-hidden">
        {/* Modal Header */}
        <div className="h-10 bg-slate-100 flex items-center justify-between px-3 border-b border-slate-300 shrink-0">
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-slate-600" />
            <span className="font-semibold text-slate-800 text-sm">
              Schema Configuration
            </span>
          </div>
          <button
            onClick={onClose}
            className="h-6 w-6 flex items-center justify-center rounded border border-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-200 hover:text-slate-700 transition-colors"
            aria-label="Close schema configuration"
          >
            <X size={14} />
          </button>
        </div>

        {/* Main Layout */}
        <div className="flex-1 flex gap-3 p-3 overflow-hidden">
          {/* LEFT PANEL — TABBED SETTINGS */}
          <div className="w-[45%] bg-white border border-slate-300 rounded-sm flex flex-col overflow-hidden">
            {/* TAB HEADER */}
            <div className="flex border-b border-slate-300 text-[11px] font-medium bg-slate-200 shrink-0">
              {[
                { id: "runtime", label: "Runtime" },
                { id: "network", label: "Network" },
                { id: "mapping", label: "Data Mapping" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveConfigTab(tab.id as any)}
                  className={`flex-1 py-2 border-r border-slate-300 last:border-r-0 transition-colors ${
                    activeConfigTab === tab.id
                      ? "bg-white text-slate-900 font-semibold"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT — FIXED HEIGHT / NO SCROLL */}
            <div className="flex-1 p-4 text-xs overflow-y-auto">
              {/* RUNTIME TAB */}
              {activeConfigTab === "runtime" && (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="font-medium text-slate-600 block mb-1">
                      Naming Convention Strategy
                    </label>
                    <select className="w-full p-2 border border-slate-300 rounded-sm bg-white outline-none focus:border-blue-500">
                      <option>snake_case (user_id)</option>
                      <option>camelCase (userId)</option>
                      <option>PascalCase (UserId)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-medium text-slate-600 block mb-1">
                        maxRetries
                      </label>
                      <input
                        type="number"
                        defaultValue={5}
                        className="w-full p-2 border border-slate-300 rounded-sm bg-white outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="font-medium text-slate-600 block mb-1">
                        retryBackoffInMs
                      </label>
                      <input
                        type="number"
                        defaultValue={2000}
                        className="w-full p-2 border border-slate-300 rounded-sm bg-white outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-medium text-slate-600 block mb-1">
                        batchSize
                      </label>
                      <input
                        type="number"
                        defaultValue={500}
                        className="w-full p-2 border border-slate-300 rounded-sm bg-white outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="font-medium text-slate-600 block mb-1">
                        logLevel
                      </label>
                      <select className="w-full p-2 border border-slate-300 rounded-sm bg-white outline-none focus:border-blue-500">
                        <option>INFO</option>
                        <option>DEBUG</option>
                        <option>WARN</option>
                        <option>ERROR</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-slate-600 block mb-1">
                      enableIdempotency
                    </label>
                    <select className="w-full p-2 border border-slate-300 rounded-sm bg-white outline-none focus:border-blue-500">
                      <option>true</option>
                      <option>false</option>
                    </select>
                  </div>
                </div>
              )}

              {/* NETWORK TAB */}
              {activeConfigTab === "network" && (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="font-medium text-slate-600 block mb-1">
                      requestTimeoutInMs
                    </label>
                    <input
                      type="number"
                      defaultValue={15000}
                      className="w-full p-2 border border-slate-300 rounded-sm bg-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-slate-600 block mb-1">
                      enableDeadLetterQueue
                    </label>
                    <select className="w-full p-2 border border-slate-300 rounded-sm bg-white outline-none focus:border-blue-500">
                      <option>true</option>
                      <option>false</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-medium text-slate-600 block mb-1">
                      defaultTargetDatabase
                    </label>
                    <input
                      type="text"
                      defaultValue="mongo_prod_cluster"
                      className="w-full p-2 border border-slate-300 rounded-sm bg-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-slate-600 block mb-1">
                      themeSelection
                    </label>
                    <select className="w-full p-2 border border-slate-300 rounded-sm bg-white outline-none focus:border-blue-500">
                      <option>light</option>
                      <option>dark</option>
                      <option>system</option>
                    </select>
                  </div>
                </div>
              )}

              {/* DATA MAPPING TAB */}
              {activeConfigTab === "mapping" && (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="font-medium text-slate-600 block mb-1">
                      enableSchemaValidation
                    </label>
                    <select className="w-full p-2 border border-slate-300 rounded-sm bg-white outline-none focus:border-blue-500">
                      <option>true</option>
                      <option>false</option>
                    </select>
                  </div>

                  <div className="bg-slate-100 border border-slate-300 rounded-sm p-3 text-[11px] font-mono text-slate-600">
                    Field mappings are defined in the JSON configuration panel.
                  </div>

                  <div className="bg-sky-50 border border-sky-200 rounded-sm p-3 text-[11px] text-sky-800">
                    Operation Mode: <strong>upsert</strong> <br />
                    Primary Keys enforced per collection.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL — JSON CONFIG */}
          <div className="flex-1 bg-white rounded-sm flex flex-col border border-slate-300 overflow-hidden">
            <div className="bg-slate-200 px-3 py-1.5 text-[10px] text-slate-600 flex justify-between border-b border-slate-300 shrink-0">
              <span>schema_transform.production.json</span>
              <span>JSON</span>
            </div>

            <textarea
              className="flex-1 bg-white text-slate-700 font-mono text-[11px] p-3 focus:outline-none resize-none leading-relaxed"
              defaultValue={`{\n  "version": "1.2.0",\n  "environment": "production",\n  "maxRetries": 5,\n  "retryBackoffInMs": 2000,\n  "requestTimeoutInMs": 15000,\n  "batchSize": 500,\n  "enableIdempotency": true,\n  "enableSchemaValidation": true,\n  "enableDeadLetterQueue": true,\n  "logLevel": "INFO",\n  "defaultTargetDatabase": "mongo_prod_cluster"\n}`}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="h-11 bg-slate-100 border-t border-slate-300 flex items-center justify-end px-3 gap-2 shrink-0">
          <button
            className="h-7 px-4 bg-white border border-slate-400 hover:bg-slate-50 rounded-sm text-slate-700 text-xs transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="h-7 px-4 flex items-center gap-1.5 bg-blue-600 border border-blue-700 text-white text-xs rounded-sm hover:bg-blue-700 transition-colors font-medium"
            onClick={() => {
              // Add any save logic here
              onClose();
            }}
          >
            <Save size={14} /> Apply Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
