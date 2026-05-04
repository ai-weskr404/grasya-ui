import { Icon } from "@blueprintjs/core";

export interface MenuContext {
  isConnected: boolean;
  isRunning: boolean;
}

export const MenuBar = ({
  context,
  commands,
}: {
  context: MenuContext;
  commands: Record<string, () => void>;
}) => {
  return (
    <div className="border-b border-slate-300 bg-[#f3f4f6]">
      <div className="h-8 flex items-center gap-1 px-2 border-b border-slate-200">
        <button className="ribbon-icon-btn" title="New Job" onClick={commands.NEW_JOB}><Icon icon="document" size={13} /></button>
        <button className="ribbon-icon-btn" title="Refresh" onClick={commands.REFRESH}><Icon icon="refresh" size={13} /></button>
        <span className="ribbon-sep" />
        <button className="ribbon-icon-btn" title="Connect" onClick={commands.CONNECT}><Icon icon="database" size={13} /></button>
        <button className="ribbon-icon-btn" title="Run" onClick={commands.RUN} disabled={!context.isConnected || context.isRunning}><Icon icon="play" size={13} /></button>
        <button className="ribbon-icon-btn" title="Pause" onClick={commands.PAUSE} disabled={!context.isRunning}><Icon icon="pause" size={13} /></button>
        <button className="ribbon-icon-btn" title="Stop" onClick={commands.KILL}><Icon icon="stop" size={13} /></button>
        <button className="ribbon-icon-btn" title="Cutover" onClick={commands.CUTOVER}><Icon icon="flow-branch" size={13} /></button>
        <span className="ribbon-sep" />
        <button className="ribbon-icon-btn" title="Verify" onClick={commands.VERIFY}><Icon icon="shield" size={13} /></button>
        <button className="ribbon-icon-btn" title="Drift" onClick={commands.DRIFT}><Icon icon="search" size={13} /></button>
        <button className="ribbon-icon-btn" title="Schema" onClick={commands.OPEN_SCHEMA}><Icon icon="layout" size={13} /></button>
        <button className="ribbon-icon-btn" title="DLQ" onClick={commands.OPEN_DLQ}><Icon icon="warning-sign" size={13} /></button>
      </div>
      <div className="h-8 flex items-center px-2 gap-2">
        <button className="toolbar-btn" onClick={commands.CONNECT}><span className="dot" />{context.isConnected ? "Connected" : "Connect"}</button>
        <button className="toolbar-btn" onClick={commands.RUN}>Run</button>
        <button className="toolbar-btn" onClick={commands.PAUSE}>Pause</button>
        <button className="toolbar-btn" onClick={commands.KILL}>Stop</button>
        <button className="toolbar-btn" onClick={commands.CUTOVER}>Cutover</button>
      </div>
    </div>
  );
};
