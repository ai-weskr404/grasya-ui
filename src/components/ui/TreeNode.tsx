import React from 'react';
import { ChevronDown, ChevronRight, Table, Layout, Database } from 'lucide-react';
import type{ FileNode } from '../../types';

interface TreeNodeProps {
  node: FileNode;
  level: number;
  toggleNode: (id: string) => void;
}

export const TreeNode: React.FC<TreeNodeProps> = ({ node, level, toggleNode }) => {
  const isFolder = node.type === 'folder';
  const Icon = node.type === 'table' ? Table : node.type === 'view' ? Layout : Database;
  
  return (
    <div>
      <div 
        className="flex items-center py-0.5 hover:bg-blue-50 cursor-pointer select-none text-[12px] whitespace-nowrap"
        style={{ paddingLeft: `${level * 16 + 4}px` }}
        onClick={() => isFolder && toggleNode(node.id)}
      >
        {isFolder && (
          <span className="mr-1 text-slate-500">
            {node.isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
        )}
        {!isFolder && <span className="w-[16px]" />}
        <Icon size={14} className={`mr-1.5 ${node.name.includes('AWS') ? 'text-orange-500' : node.type === 'folder' ? 'text-yellow-500 fill-yellow-100' : 'text-blue-600'}`} />
        <span className="text-slate-800">{node.name}</span>
      </div>
      {isFolder && node.isOpen && node.children && (
        <div>
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} level={level + 1} toggleNode={toggleNode} />
          ))}
        </div>
      )}
    </div>
  );
};