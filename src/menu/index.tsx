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
      <div className="h-10 app-toolbar px-2 border-b border-slate-200">
        <button
          className="ribbon-icon-btn app-btn app-icon-btn"
          title="New Job"
          onClick={commands.NEW_JOB}
        >
          <Icon icon="add-application" size={13} />
        </button>
        <button
          className="ribbon-icon-btn app-btn app-icon-btn"
          title="Refresh"
          onClick={commands.REFRESH}
        >
          <Icon icon="table-sync" size={13} />
        </button>
        <span className="ribbon-sep" />
        <button
          className="ribbon-icon-btn app-btn app-icon-btn"
          title={context.isConnected ? "Connected" : "Connect"}
          onClick={commands.CONNECT}
          disabled={context.isConnected}
        >
          <Icon icon="linked-squares" size={13} />
        </button>
        <button
          className="ribbon-icon-btn app-btn app-icon-btn"
          title="Run"
          onClick={commands.RUN}
          disabled={!context.isConnected || context.isRunning}
        >
          <Icon icon="play" size={13} />
        </button>
        <button
          className="ribbon-icon-btn app-btn app-icon-btn"
          title="Pause"
          onClick={commands.PAUSE}
          disabled={!context.isRunning}
        >
          <Icon icon="pause" size={13} />
        </button>
        <button
          className="ribbon-icon-btn app-btn app-icon-btn"
          title="Stop"
          onClick={commands.KILL}
        >
          <Icon icon="stop" size={13} />
        </button>
        <button
          className="ribbon-icon-btn app-btn app-icon-btn"
          title="Cutover"
          onClick={commands.CUTOVER}
        >
          <Icon icon="swap-horizontal" size={13} />
        </button>
        <span className="ribbon-sep" />
        <button
          className="ribbon-icon-btn app-btn app-icon-btn"
          title="Verify"
          onClick={commands.VERIFY}
        >
          <Icon icon="frame-to-frame" size={13} />
        </button>
        <button
          className="ribbon-icon-btn app-btn app-icon-btn"
          title="Drift"
          onClick={commands.DRIFT}
        >
          <Icon icon="join-table" size={13} />
        </button>
        <button
          className="ribbon-icon-btn app-btn app-icon-btn"
          title="Mapping"
          onClick={commands.OPEN_SCHEMA}
        >
          <Icon icon="th" size={13} />
        </button>
        <button
          className="ribbon-icon-btn app-btn app-icon-btn"
          title="My Tables"
          onClick={commands.OPEN_BLUEGREEN}
        >
          <Icon icon="package" size={13} />
        </button>
      </div>
    </div>
  );
};
