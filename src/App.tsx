import { useState, useEffect } from 'react';
import { 
  Database, Play, Pause, Square, Save, FileText, RefreshCw, 
  Server, ShieldCheck, Search, Table, Layout, X, Network, Cloud, Settings
} from 'lucide-react';

import type{ LogEntry, FileNode } from './types';
import { INITIAL_LOGS, DB_SCHEMA } from './data/mock-data';

import { RibbonGroup, RibbonBtn } from './components/ui/Ribbon';
import { TreeNode } from './components/ui/TreeNode';
import { TelemetryBar } from './components/ui/TelemetryBar';
import { ConnectionDialog } from './components/modals/ConnectionDialog';
import { MonitorView } from './components/views/MonitorView';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'migration' | 'integrity' | 'view'>('home');
  const [isConnected, setIsConnected] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isAwsEnabled, setIsAwsEnabled] = useState(true);
  
  // Workspace Tab State
  const [workspaceTabs, setWorkspaceTabs] = useState<string[]>(['Start Page']);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('Start Page');
  
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [treeData, setTreeData] = useState<FileNode[]>(DB_SCHEMA);
  
  // Telemetry Simulation
  const [telemetry, setTelemetry] = useState({ cpu: 12, memory: 45, throughput: 0, upload: 0 });

  const addLog = (msg: string, type: LogEntry['type']) => {
    setLogs(prev => [...prev, {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      message: msg,
      type
    }]);
  };

  useEffect(() => {
    let interval: number;
    if (isRunning && isConnected) {
      interval = setInterval(() => {
        const actions = [
          'Reading WAL segment 00000001...',
          'Transforming JSON BSON...',
          'Upserting document to Mongo collection...',
          'Commit offset to Kafka...',
          'S3 Multipart Upload: Chunk 45/100',
          'Syncing to AWS Region us-east-1...',
          'Autovacuum skipped on pg_toast'
        ];
        const actionMsg = actions[Math.floor(Math.random() * actions.length)] ?? 'Performing background task...';
        addLog(actionMsg, 'info');
        
        setTelemetry({
          cpu: Math.floor(Math.random() * 30) + 20,
          memory: Math.floor(Math.random() * 20) + 40,
          throughput: Math.floor(Math.random() * 500) + 1000,
          upload: Math.floor(Math.random() * 40) + 30
        });

      }, 1500);
    } else {
       setTelemetry({ cpu: 5, memory: 15, throughput: 0, upload: 0 });
    }
    return () => clearInterval(interval);
  }, [isRunning, isConnected]);

  const handleConnectClick = () => {
    if (isConnected) {
      setIsConnected(false);
      setIsRunning(false);
      setWorkspaceTabs(prev => prev.filter(t => t !== 'Monitor: PG -> Mongo -> AWS'));
      setActiveWorkspaceTab('Start Page');
      addLog('Disconnected from all endpoints.', 'warning');
    } else {
      setShowConnectDialog(true);
    }
  };

  const handleConfirmConnect = () => {
      setShowConnectDialog(false);
      setIsConnected(true);
      
      const tabName = 'Monitor: PG -> Mongo -> AWS';
      if (!workspaceTabs.includes(tabName)) {
        setWorkspaceTabs(prev => [...prev, tabName]);
      }
      setActiveWorkspaceTab(tabName);
      addLog('Connected to PostgreSQL, MongoDB Atlas, and AWS S3.', 'success');
  };

  const toggleRun = () => {
    if (!isConnected) return alert("Please connect first!");
    setIsRunning(!isRunning);
    addLog(isRunning ? 'Migration pipeline paused.' : 'Migration pipeline initialized.', isRunning ? 'warning' : 'success');
  };

  const toggleTreeNode = (id: string) => {
    const updateNodes = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.id === id) return { ...node, isOpen: !node.isOpen };
        if (node.children) return { ...node, children: updateNodes(node.children) };
        return node;
      });
    };
    setTreeData(updateNodes(treeData));
  };

  const renderRibbonContent = () => {
    switch(activeTab) {
      case 'home':
        return (
          <>
            <RibbonGroup label="Server">
              <RibbonBtn 
                icon={isConnected ? Square : Server} 
                label={isConnected ? "Disconnect" : "Connect"} 
                onClick={handleConnectClick}
                color={isConnected ? 'text-red-600' : 'text-slate-700'}
              />
              <div className="flex flex-col gap-1">
                 <RibbonBtn icon={RefreshCw} label="Refresh" variant="small" />
                 <RibbonBtn icon={Settings} label="Config" variant="small" />
              </div>
            </RibbonGroup>
            <RibbonGroup label="Definition">
              <RibbonBtn icon={FileText} label="New Job" />
              <RibbonBtn icon={Save} label="Save Meta" variant="large" />
            </RibbonGroup>
          </>
        );
      case 'migration':
        return (
          <>
            <RibbonGroup label="Execution">
              <RibbonBtn 
                icon={Play} 
                label="Execute" 
                onClick={() => !isRunning && toggleRun()} 
                active={isRunning} 
                color="text-green-600"
              />
              <RibbonBtn 
                icon={Pause} 
                label="Pause" 
                onClick={() => isRunning && toggleRun()} 
                color="text-amber-600"
              />
              <RibbonBtn icon={Square} label="Kill" color="text-red-600" />
            </RibbonGroup>
            <RibbonGroup label="Pipeline">
               <div className="flex flex-col gap-1">
                 <RibbonBtn icon={Table} label="Map Tables" variant="small" />
                 <RibbonBtn icon={Layout} label="Schema" variant="small" />
              </div>
            </RibbonGroup>
          </>
        );
      case 'integrity':
        return (
           <RibbonGroup label="Audit">
             <RibbonBtn icon={ShieldCheck} label="Verify" />
             <RibbonBtn icon={Search} label="Drift Check" />
           </RibbonGroup>
        );
      default:
        return <div className="p-4 text-xs text-slate-400 italic">Context options not available.</div>;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-200 overflow-hidden font-sans text-slate-900 selection:bg-blue-200 relative">
      
      <ConnectionDialog 
        show={showConnectDialog}
        onClose={() => setShowConnectDialog(false)}
        onConfirm={handleConfirmConnect}
        isAwsEnabled={isAwsEnabled}
        setIsAwsEnabled={setIsAwsEnabled}
      />

      {/* 1. TOP WINDOW TITLE BAR */}
      <div className="h-8 bg-slate-900 flex items-center px-4 justify-between select-none shrink-0">
        <div className="flex items-center gap-2">
          <Database className="text-blue-400 w-4 h-4" />
          <span className="text-xs text-slate-200 font-semibold tracking-wide">
            G.R.A.S.Y.A. Enterprise Manager {isConnected ? '- [PostgreSQL -> Mongo -> AWS]' : '- [No Connection]'}
          </span>
        </div>
        <div className="flex gap-4">
           <div className="w-3 h-3 rounded-full bg-slate-600 hover:bg-slate-500"></div>
           <div className="w-3 h-3 rounded-full bg-slate-600 hover:bg-slate-500"></div>
           <div className="w-3 h-3 rounded-full bg-red-900 hover:bg-red-600"></div>
        </div>
      </div>

      {/* 2. RIBBON INTERFACE */}
      <div className="bg-slate-100 border-b border-slate-300 shadow-sm flex flex-col shrink-0">
        <div className="flex px-2 pt-1 gap-1 border-b border-slate-300 bg-slate-50">
          {['Home', 'Migration', 'Integrity', 'View'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase() as any)}
              className={`px-5 py-1 text-[12px] rounded-t-sm transition-colors border-t border-l border-r ${
                activeTab === tab.toLowerCase() 
                  ? 'bg-slate-100 border-slate-300 border-b-slate-100 font-medium text-blue-900 relative top-[1px] z-10' 
                  : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="h-24 bg-slate-100 flex items-center px-2 py-2 overflow-x-auto">
          {renderRibbonContent()}
        </div>
      </div>

      {/* 3. MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* A. Object Explorer */}
        <div className="w-64 bg-white border-r border-slate-300 flex flex-col shrink-0 z-20">
          <div className="h-6 bg-slate-100 border-b border-slate-300 flex items-center px-2 justify-between">
             <span className="text-[11px] font-bold text-slate-700 uppercase">Object Explorer</span>
             <X size={12} className="text-slate-400" />
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {!isConnected ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                 <Server size={32} strokeWidth={1} />
                 <span className="text-xs mt-2">Not Connected</span>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {treeData.map(node => (
                  <TreeNode key={node.id} node={node} level={0} toggleNode={toggleTreeNode} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* B. Central Canvas & Tabs */}
        <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
          
          <div className="flex bg-slate-200 border-b border-slate-300 h-6 items-end px-1 gap-1 shrink-0">
            {workspaceTabs.map(tab => (
               <div 
                 key={tab}
                 onClick={() => setActiveWorkspaceTab(tab)}
                 className={`
                    px-3 h-[23px] text-[11px] flex items-center gap-2 cursor-pointer select-none
                    ${activeWorkspaceTab === tab 
                       ? 'bg-slate-50 border-t border-l border-r border-slate-300 font-medium text-blue-700' 
                       : 'bg-slate-300 text-slate-600 hover:bg-slate-200 border-r border-slate-400/30'
                    }
                 `}
               >
                 <span>{tab}</span>
                 {tab !== 'Start Page' && <X size={10} className="hover:bg-slate-300 rounded" />}
               </div>
            ))}
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0 overflow-auto bg-white">
               {activeWorkspaceTab === 'Start Page' ? (
                  <div className="h-full flex items-center justify-center bg-slate-50">
                     <div className="text-center">
                        <h1 className="text-2xl font-light text-slate-400 mb-2">G.R.A.S.Y.A.</h1>
                        <p className="text-sm text-slate-500 mb-6">Database Migration Suite</p>
                        {!isConnected && (
                           <button onClick={handleConnectClick} className="text-xs px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                              Connect to Server
                           </button>
                        )}
                     </div>
                  </div>
               ) : (
                  <MonitorView logs={logs} isRunning={isRunning} isAwsEnabled={isAwsEnabled} />
               )}
            </div>

            {/* C. Right Telemetry (Only when connected) */}
            {isConnected && activeWorkspaceTab !== 'Start Page' && (
               <div className="w-[220px] bg-slate-50 border-l border-slate-300 flex flex-col shrink-0 z-10 shadow-[-2px_0_5px_rgba(0,0,0,0.02)]">
                  <div className="h-6 bg-slate-200 border-b border-slate-300 flex items-center px-2 shadow-sm">
                     <span className="text-[11px] font-bold text-slate-700 uppercase">Telemetry</span>
                  </div>
                  <div className="p-3 overflow-y-auto flex-1">
                     <div className="bg-white border border-slate-200 p-3 rounded mb-4 shadow-sm">
                        <h4 className="text-[11px] font-bold text-slate-800 mb-3 flex items-center gap-2">
                           <Server size={12} className="text-blue-500"/> Node Metrics
                        </h4>
                        <TelemetryBar label="CPU Usage" value={telemetry.cpu} color="bg-blue-500" />
                        <TelemetryBar label="Memory" value={telemetry.memory} color="bg-purple-500" />
                     </div>

                     <div className="bg-white border border-slate-200 p-3 rounded mb-4 shadow-sm">
                        <h4 className="text-[11px] font-bold text-slate-800 mb-3 flex items-center gap-2">
                           <Network size={12} className="text-green-500"/> Throughput
                        </h4>
                        <div className="text-2xl font-light text-slate-800 mb-1">{telemetry.throughput}</div>
                        <div className="text-[10px] text-slate-400 uppercase">Msg / Sec</div>
                     </div>

                     {isAwsEnabled && (
                       <div className="bg-white border border-slate-200 p-3 rounded mb-4 shadow-sm">
                          <h4 className="text-[11px] font-bold text-slate-800 mb-3 flex items-center gap-2">
                             <Cloud size={12} className="text-orange-500"/> Cloud Sync
                          </h4>
                          <TelemetryBar label="S3 Upload" value={telemetry.upload} color="bg-orange-500" />
                          <div className="text-[10px] text-slate-400 uppercase mt-1">Region: us-east-1</div>
                       </div>
                     )}
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. STATUS BAR */}
      <div className="h-6 bg-blue-700 text-white flex items-center justify-between px-3 text-[11px] select-none shrink-0">
        <div className="flex gap-4">
          <span className="font-medium">{isConnected ? 'Ready' : 'Disconnected'}</span>
          {isRunning && <span className="animate-pulse text-yellow-300">● Migrating...</span>}
        </div>
        <div className="flex gap-6 opacity-90">
           <span>Ln 1, Col 1</span>
           <span>UTF-8</span>
           <span>User: Admin</span>
           <span>Latency: {isConnected ? '2ms' : '-'}</span>
        </div>
      </div>
    </div>
  );
}