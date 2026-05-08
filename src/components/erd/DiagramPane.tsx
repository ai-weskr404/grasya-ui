import { DataModelProvider, ERDiagram } from "@eavfw/er-diagram";
import { useMemo } from "react";
import type { TableDef } from "./types";

export default function DiagramPane({ tables }: { tables: TableDef[] }) {
  const schema = useMemo(() => {
    const modules = Array.from(new Set(tables.map((table) => table.schema || "dbo")));

    return {
      modules,
      tables: tables.map((table) => ({
        name: table.name,
        module: table.schema || "dbo",
        locales: {
          "1033": {
            singular: table.name,
            plural: `${table.name}s`,
          },
        },
        attributes: Object.fromEntries(
          table.columns.map((column) => [
            column.name,
            {
              name: column.name,
              type: column.type,
              isPrimary: column.isPrimary,
              isForeign: column.isForeign,
              ...(column.referencesTable && column.referencesColumn
                ? {
                    references: {
                      table: column.referencesTable,
                      attribute: column.referencesColumn,
                    },
                  }
                : {}),
            },
          ]),
        ),
      })),
    };
  }, [tables]);

  return (
    <div className="h-full w-full">
      <DataModelProvider initialSchema={schema}>
        <ERDiagram />
      </DataModelProvider>
    </div>
  );
}
