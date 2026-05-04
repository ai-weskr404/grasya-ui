import { Icon } from '@blueprintjs/core';
import type { TableDef } from './types';

export default function TableNode({ data }: { data: TableDef }) {
  return (
    <div className="react-flow__node-tableNode bp5-ui-text">
      <div className="table-node-header">
        <Icon icon="th" size={14} />
        {data.schema}.{data.name}
      </div>

      <div className="table-node-columns">
        {data.columns.map((col, idx) => (
          <div key={idx} className="table-node-row">
            <div className="table-node-row-left">
              {col.isPrimary ? <Icon icon="key" size={12} color="#BF7326" /> : col.isForeign ? <Icon icon="link" size={12} color="#106BA3" /> : <div style={{ width: 12 }}></div>}
              <span style={{ fontWeight: col.isPrimary ? 'bold' : 'normal' }}>{col.name}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="table-node-type">{col.type}</span>
              {col.notNull && <span className="table-node-tag">NOT NULL</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
