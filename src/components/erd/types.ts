export interface ColumnDef {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
  notNull?: boolean;
}

export interface TableDef {
  id: string;
  name: string;
  schema: string;
  columns: ColumnDef[];
}
