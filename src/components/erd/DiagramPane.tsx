import { useMemo } from "react";
import { RelationshipDiagram } from "react-erd";
import "react-erd/dist/style.css";
import type { TableDef } from "./types";

type SchemaColumn = {
  name: string;
  type: string;
  foreignKeys: Array<{
    foreignSchemaName: string;
    foreignTableName: string;
    foreignColumnName: string;
    constrained: boolean;
  }>;
};

export default function DiagramPane({ tables }: { tables: TableDef[] }) {
  const schemas = useMemo(() => {
    const grouped = new Map<string, { name: string; tables: Array<{ name: string; primaryKey: string; columns: SchemaColumn[] }> }>();

    tables.forEach((table) => {
      const schemaName = table.schema || "dbo";
      if (!grouped.has(schemaName)) grouped.set(schemaName, { name: schemaName, tables: [] });

      const primaryKey = table.columns.find((c) => c.isPrimary)?.name ?? table.columns[0]?.name ?? "id";
      const columns: SchemaColumn[] = table.columns.map((column) => ({
        name: column.name,
        type: column.type,
        foreignKeys: column.isForeign
          ? [
              {
                foreignSchemaName: schemaName,
                foreignTableName: column.referencesTable ?? "",
                foreignColumnName: column.referencesColumn ?? "id",
                constrained: true,
              },
            ]
          : [],
      }));

      grouped.get(schemaName)?.tables.push({
        name: table.name,
        primaryKey,
        columns,
      });
    });

    return Array.from(grouped.values());
  }, [tables]);

  return (
    <div className="h-full w-full overflow-hidden">
      <RelationshipDiagram schemas={schemas} />
    </div>
  );
}
