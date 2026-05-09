import type { TableDef } from "./types";

export const DEFAULT_ERD_SELECTED_TABLES = [
  "sales.customers",
  "sales.orders",
  "sales.order_items",
  "catalog.products",
] as const;

type RelationshipDef = {
  fkColumn: string;
  referencesSchema: string;
  referencesTable: string;
  referencesColumn: string;
};

const defaultAuditColumns = [
  { name: "created_at", type: "timestamp", notNull: true },
  { name: "updated_at", type: "timestamp", notNull: false },
  { name: "status", type: "varchar", notNull: false },
];

const tableRelationshipMap: Record<string, RelationshipDef[]> = {
  orders: [
    {
      fkColumn: "customer_id",
      referencesSchema: "sales",
      referencesTable: "customers",
      referencesColumn: "customer_id",
    },
  ],
  order_items: [
    {
      fkColumn: "order_id",
      referencesSchema: "sales",
      referencesTable: "orders",
      referencesColumn: "order_id",
    },
    {
      fkColumn: "product_id",
      referencesSchema: "catalog",
      referencesTable: "products",
      referencesColumn: "product_id",
    },
  ],
};

const tablePrimaryKeyMap: Record<string, string> = {
  customers: "customer_id",
  orders: "order_id",
  order_items: "order_item_id",
  products: "product_id",
};

export const getTableKey = (tableName: string) =>
  tableName
    .toLowerCase()
    .split(".")
    .filter(Boolean)
    .at(-1)
    ?.replace(/[^a-z0-9_]/g, "") ?? "";

const getTableSchema = (tableName: string) => {
  const [schemaName] = tableName.split(".");
  return schemaName?.trim() || "dbo";
};

export const normalizeSelectedTables = (selectedTables: string[]): string[] => {
  const seen = new Set<string>();

  return selectedTables
    .map((table) => table?.trim())
    .filter((table): table is string => Boolean(table))
    .filter((table) => {
      const tableKey = getTableKey(table);
      if (!tableKey || seen.has(table)) return false;
      seen.add(table);
      return true;
    });
};

export const mapSelectedTablesToDiagram = (selectedTables: string[]): TableDef[] => {
  const normalizedTables = normalizeSelectedTables(selectedTables);
  const selectedTableNames = new Set(normalizedTables.map((table) => table.toLowerCase()));

  return normalizedTables.map((tableName) => {
    const tableKey = getTableKey(tableName);
    const tableSchema = getTableSchema(tableName);
    const tableOnlyName = tableName.split(".").at(-1) ?? tableName;
    const primaryKey = tablePrimaryKeyMap[tableKey] ?? `${tableKey}_id`;

    const relationships = (tableRelationshipMap[tableKey] ?? []).filter((rel) => {
      const target = `${rel.referencesSchema}.${rel.referencesTable}`.toLowerCase();
      return selectedTableNames.has(target);
    });

    const relationshipColumns = relationships.map((relationship) => ({
      name: relationship.fkColumn,
      type: "int",
      isForeign: true,
      notNull: true,
      referencesTable: relationship.referencesTable,
      referencesColumn: relationship.referencesColumn,
    }));

    return {
      id: `${tableSchema}_${tableOnlyName}`.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
      name: tableOnlyName,
      schema: tableSchema,
      columns: [
        { name: primaryKey, type: "int", isPrimary: true, notNull: true },
        ...relationshipColumns,
        ...defaultAuditColumns,
      ],
    };
  });
};
