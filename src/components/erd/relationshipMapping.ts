import type { TableDef } from "./types";

export type Cardinality = "1:1" | "1:N" | "N:1" | "N:N";
export type MappingStrategy = "embedded" | "referenced";

export interface RelationshipMappingItem {
  id: string;
  sourceSchema: string;
  sourceTable: string;
  sourceColumn: string;
  targetSchema: string;
  targetTable: string;
  targetColumn: string;
  detectedCardinality: Cardinality;
}

const detectCardinality = (sourceTable: TableDef, sourceColumn: string): Cardinality => {
  const column = sourceTable.columns.find((c) => c.name === sourceColumn);
  if (column?.isPrimary) return "1:1";
  return "N:1";
};

export const buildRelationshipMappings = (tables: TableDef[]): RelationshipMappingItem[] =>
  tables.flatMap((table) =>
    table.columns
      .filter((column) => column.isForeign && column.referencesTable && column.referencesColumn)
      .map((column) => ({
        id: `${table.schema}.${table.name}.${column.name}:${column.referencesSchema ?? table.schema}.${column.referencesTable}.${column.referencesColumn}`,
        sourceSchema: table.schema,
        sourceTable: table.name,
        sourceColumn: column.name,
        targetSchema: column.referencesSchema ?? table.schema,
        targetTable: column.referencesTable as string,
        targetColumn: column.referencesColumn as string,
        detectedCardinality: detectCardinality(table, column.name),
      })),
  );
