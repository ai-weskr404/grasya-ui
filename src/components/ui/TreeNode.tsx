import React from "react";
import { Icon } from "@blueprintjs/core";
import { DatabaseFilled } from "@fluentui/react-icons";
import type { FileNode } from "../../types";

interface TreeNodeProps {
  node: FileNode;
  level: number;
  toggleNode: (id: string) => void;
}

export const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  level,
  toggleNode,
}) => {
  const isFolder = node.type === "folder";
  const iconColor =
    node.name.includes("Atlas") || node.name.includes("MongoDB_Storage")
      ? "text-orange-500"
      : isFolder
        ? "text-yellow-500"
        : "text-blue-600";

  return (
    <div>
      <div
        className="flex items-center py-0.5 hover:bg-blue-50 cursor-pointer select-none text-[12px] whitespace-nowrap"
        style={{ paddingLeft: `${level * 16 + 4}px` }}
        onClick={() => isFolder && toggleNode(node.id)}
      >
        {isFolder && (
          <span className="mr-1 text-slate-500">
            <Icon
              icon={node.isOpen ? "chevron-down" : "chevron-right"}
              size={12}
            />
          </span>
        )}
        {!isFolder && <span className="w-[16px]" />}
        {node.type === "table" || node.type === "view" ? (
          <Icon
            icon={node.type === "table" ? "th" : "layout-auto"}
            size={14}
            className={`mr-1.5 ${iconColor}`}
          />
        ) : (
          <DatabaseFilled
            style={{ fontSize: "14px" }}
            className={`mr-1.5 ${iconColor}`}
          />
        )}
        <span className="text-slate-800">{node.name}</span>
      </div>
      {isFolder && node.isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              toggleNode={toggleNode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const getObjectExplorerIcon = (
  nodeType: FileNode["type"],
  expanded: boolean,
) => {
  if (nodeType === "folder") {
    return (
      <Icon
        icon={expanded ? "folder-open" : "folder-close"}
        size={12}
        className="text-amber-500"
      />
    );
  }

  if (nodeType === "table") {
    return <Icon icon="th" size={12} className="text-slate-600" />;
  }

  if (nodeType === "view") {
    return <Icon icon="table" size={12} className="text-blue-500" />;
  }

  return <DatabaseFilled style={{ fontSize: "12px" }} className="text-cyan-700" />;
};
