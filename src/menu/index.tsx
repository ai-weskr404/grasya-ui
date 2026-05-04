import React from "react";
import { Menu, MenuItem, Divider, Popover, Position } from "@blueprintjs/core";

/* =========================
   TYPES
========================= */

export type MenuAction =
  | "NEW_JOB"
  | "CONNECT"
  | "REFRESH"
  | "RUN"
  | "PAUSE"
  | "KILL"
  | "CUTOVER"
  | "VERIFY"
  | "DRIFT"
  | "CLEAR_LOGS"
  | "OPEN_SCHEMA"
  | "OPEN_DLQ";

export interface MenuContext {
  isConnected: boolean;
  isRunning: boolean;
  trafficState: "BLUE_POSTGRES" | "GREEN_MONGO";
}

export interface MenuItemConfig {
  id: string;
  label?: string;
  icon?: string;
  action?: MenuAction;
  divider?: boolean;
  children?: MenuItemConfig[];

  disabled?: (ctx: MenuContext) => boolean;
  visible?: (ctx: MenuContext) => boolean;
}

/* =========================
   CONFIG
========================= */

export const MENU_CONFIG: MenuItemConfig[] = [
  {
    id: "file",
    label: "File",
    children: [
      {
        id: "new",
        label: "New Job",
        icon: "document",
        action: "NEW_JOB",
      },
      {
        id: "connect",
        label: "Connect / Disconnect",
        icon: "database",
        action: "CONNECT",
      },
    ],
  },
  {
    id: "migration",
    label: "Migration",
    children: [
      {
        id: "run",
        label: "Execute",
        icon: "play",
        action: "RUN",
        disabled: (ctx) => ctx.isRunning || !ctx.isConnected,
      },
      {
        id: "pause",
        label: "Pause",
        icon: "pause",
        action: "PAUSE",
        disabled: (ctx) => !ctx.isRunning,
      },
      {
        id: "kill",
        label: "Kill",
        icon: "stop",
        action: "KILL",
      },
      { id: "d1", divider: true },
      {
        id: "cutover",
        label: "Cutover / Rollback",
        icon: "flow-branch",
        action: "CUTOVER",
      },
    ],
  },
  {
    id: "integrity",
    label: "Integrity",
    children: [
      {
        id: "verify",
        label: "Verify",
        icon: "shield",
        action: "VERIFY",
      },
      {
        id: "drift",
        label: "Drift Check",
        icon: "search",
        action: "DRIFT",
      },
    ],
  },
  {
    id: "view",
    label: "View",
    children: [
      {
        id: "logs",
        label: "Clear Logs",
        icon: "console",
        action: "CLEAR_LOGS",
      },
      {
        id: "schema",
        label: "Schema Config",
        icon: "layout",
        action: "OPEN_SCHEMA",
      },
      {
        id: "dlq",
        label: "Dead Letter Queue",
        icon: "warning-sign",
        action: "OPEN_DLQ",
      },
    ],
  },
];

const renderMenuItems = (
  items: MenuItemConfig[],
  ctx: MenuContext,
  commands: Record<string, () => void>
) => {
  return items.map((item) => {
    if (item.visible && !item.visible(ctx)) return null;
    if (item.divider) return <Divider key={item.id} />;

    const disabled = item.disabled?.(ctx);

    if (item.children) {
      return (
        <MenuItem key={item.id} text={item.label}>
          {renderMenuItems(item.children, ctx, commands)}
        </MenuItem>
      );
    }

    return (
      <MenuItem
        key={item.id}
        icon={item.icon as any}
        text={item.label}
        disabled={disabled}
        onClick={() => item.action && commands[item.action]?.()}
      />
    );
  });
};

export const MenuBar = ({
  context,
  commands,
}: {
  context: MenuContext;
  commands: Record<string, () => void>;
}) => {
  return (
    <div className="flex gap-1 px-2 py-1 bg-slate-100 border-b border-slate-300">
      {MENU_CONFIG.map((menu) => (
        <Popover
          key={menu.id}
          content={
            <Menu>{renderMenuItems(menu.children || [], context, commands)}</Menu>
          }
          position={Position.BOTTOM_LEFT}
        >
          <span className="px-2 py-1 text-[12px] cursor-pointer hover:bg-slate-200 rounded">
            {menu.label}
          </span>
        </Popover>
      ))}
    </div>
  );
};
