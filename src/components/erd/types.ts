export interface ColumnDef {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
  notNull?: boolean;
  referencesTable?: string;
  referencesSchema?: string;
  referencesColumn?: string;
}

export interface TableDef {
  id: string;
  name: string;
  schema: string;
  columns: ColumnDef[];
}
