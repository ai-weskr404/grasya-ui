import type { TableDef } from "./types";

export const DEFAULT_ERD_SELECTED_TABLES = [
  "shop.audiences",
  "shop.customers",
  "shop.customer_audiences",
  "shop.customer_addresses",
  "shop.customer_payment_info",
  "shop.payment_card_details",
  "shop.payment_info_status",
  "shop.payment_info_fraud_detection",
  "shop.orders",
  "shop.order_fulfilment",
  "shop.order_payment",
  "shop.product_categories",
  "shop.products",
  "shop.product_category_products",
  "shop.promotions",
] as const;

type RelationshipDef = {
  fkColumn: string;
  referencesSchema: string;
  referencesTable: string;
  referencesColumn: string;
};

type ColumnDef = { name: string; type: string; notNull?: boolean; isPrimary?: boolean };

type TableBlueprint = {
  schema: string;
  columns: ColumnDef[];
  relationships?: RelationshipDef[];
};

const tableBlueprints: Record<string, TableBlueprint> = {
  audiences: { schema: "shop", columns: [{ name: "id", type: "number", isPrimary: true }, { name: "name", type: "text" }] },
  customers: { schema: "shop", columns: [{ name: "id", type: "number", isPrimary: true }, { name: "full_name", type: "text" }, { name: "email", type: "text" }] },
  customer_audiences: { schema: "shop", columns: [{ name: "customer_id", type: "number" }, { name: "audience_id", type: "number" }], relationships: [{ fkColumn: "customer_id", referencesSchema: "shop", referencesTable: "customers", referencesColumn: "id" }, { fkColumn: "audience_id", referencesSchema: "shop", referencesTable: "audiences", referencesColumn: "id" }] },
  customer_addresses: { schema: "shop", columns: [{ name: "id", type: "number", isPrimary: true }, { name: "customer_id", type: "number" }, { name: "is_primary", type: "boolean" }], relationships: [{ fkColumn: "customer_id", referencesSchema: "shop", referencesTable: "customers", referencesColumn: "id" }] },
  customer_payment_info: { schema: "shop", columns: [{ name: "id", type: "number", isPrimary: true }, { name: "customer_id", type: "number" }, { name: "type", type: "text" }, { name: "is_primary", type: "boolean" }], relationships: [{ fkColumn: "customer_id", referencesSchema: "shop", referencesTable: "customers", referencesColumn: "id" }] },
  payment_card_details: { schema: "shop", columns: [{ name: "id", type: "number", isPrimary: true }, { name: "customer_payment_info_id", type: "number" }, { name: "card_number", type: "number" }, { name: "cvc", type: "number" }, { name: "expiry", type: "number" }], relationships: [{ fkColumn: "customer_payment_info_id", referencesSchema: "shop", referencesTable: "customer_payment_info", referencesColumn: "id" }] },
  payment_info_status: { schema: "shop", columns: [{ name: "customer_payment_info_id", type: "number", isPrimary: true }, { name: "status", type: "text" }, { name: "last_verified", type: "datetime" }], relationships: [{ fkColumn: "customer_payment_info_id", referencesSchema: "shop", referencesTable: "customer_payment_info", referencesColumn: "id" }] },
  payment_info_fraud_detection: { schema: "shop", columns: [{ name: "customer_payment_info_id", type: "number", isPrimary: true }, { name: "is_suspected", type: "boolean" }], relationships: [{ fkColumn: "customer_payment_info_id", referencesSchema: "shop", referencesTable: "customer_payment_info", referencesColumn: "id" }] },
  orders: { schema: "shop", columns: [{ name: "id", type: "number", isPrimary: true }, { name: "customer_id", type: "number" }], relationships: [{ fkColumn: "customer_id", referencesSchema: "shop", referencesTable: "customers", referencesColumn: "id" }] },
  order_fulfilment: { schema: "shop", columns: [{ name: "id", type: "number", isPrimary: true }, { name: "order_id", type: "number" }, { name: "status", type: "text" }, { name: "status_at", type: "datetime" }], relationships: [{ fkColumn: "order_id", referencesSchema: "shop", referencesTable: "orders", referencesColumn: "id" }] },
  order_payment: { schema: "shop", columns: [{ name: "order_id", type: "number", isPrimary: true }], relationships: [{ fkColumn: "order_id", referencesSchema: "shop", referencesTable: "orders", referencesColumn: "id" }] },
  product_categories: { schema: "shop", columns: [{ name: "slug", type: "text", isPrimary: true }, { name: "name", type: "text" }] },
  products: { schema: "shop", columns: [{ name: "slug", type: "text", isPrimary: true }, { name: "name", type: "text" }, { name: "description", type: "text" }] },
  product_category_products: { schema: "shop", columns: [{ name: "product_category_slug", type: "text" }, { name: "product_slug", type: "text" }], relationships: [{ fkColumn: "product_category_slug", referencesSchema: "shop", referencesTable: "product_categories", referencesColumn: "slug" }, { fkColumn: "product_slug", referencesSchema: "shop", referencesTable: "products", referencesColumn: "slug" }] },
  promotions: { schema: "shop", columns: [{ name: "id", type: "number", isPrimary: true }, { name: "start_date", type: "datetime" }, { name: "end_date", type: "datetime" }] },
};

export const getTableKey = (tableName: string) => tableName.toLowerCase().split('.').filter(Boolean).at(-1)?.replace(/[^a-z0-9_]/g, "") ?? "";

export const normalizeSelectedTables = (selectedTables: string[]): string[] => {
  const seen = new Set<string>();
  return selectedTables.map((t) => t?.trim()).filter((t): t is string => Boolean(t)).filter((table) => {
    const normalized = table.toLowerCase();
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return Boolean(getTableKey(table));
  });
};

export const mapSelectedTablesToDiagram = (selectedTables: string[]): TableDef[] => {
  const normalizedTables = normalizeSelectedTables(selectedTables);
  const selectedSet = new Set(normalizedTables.map((t) => t.toLowerCase()));

  return normalizedTables.map((fullName) => {
    const [schemaFromName, tableNameRaw] = fullName.split('.');
    const tableName = tableNameRaw ?? fullName;
    const key = getTableKey(fullName);
    const blueprint = tableBlueprints[key];
    const schema = blueprint?.schema ?? schemaFromName ?? 'core';
    const columns = blueprint?.columns ?? [{ name: `${key || tableName}_id`, type: 'uuid', isPrimary: true, notNull: true }];
    const relationships = (blueprint?.relationships ?? []).filter((rel) => selectedSet.has(`${rel.referencesSchema}.${rel.referencesTable}`.toLowerCase()));

    const relationshipByColumn = new Map(relationships.map((r) => [r.fkColumn, r]));

    return {
      id: `${schema}_${tableName}`.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      name: tableName,
      schema,
      columns: columns.map((col) => ({
        name: col.name,
        type: col.type,
        notNull: Boolean(col.notNull),
        isPrimary: Boolean(col.isPrimary),
        isForeign: relationshipByColumn.has(col.name),
        referencesSchema: relationshipByColumn.get(col.name)?.referencesSchema,
        referencesTable: relationshipByColumn.get(col.name)?.referencesTable,
        referencesColumn: relationshipByColumn.get(col.name)?.referencesColumn,
      })),
    };
  });
};


export const hasKnownTableBlueprint = (tableName: string): boolean => {
  const key = getTableKey(tableName);
  return Boolean(tableBlueprints[key]);
};

export const resolveDiagramTables = (selectedTables: string[]): string[] => {
  const normalized = normalizeSelectedTables(selectedTables);
  if (normalized.length === 0) return [...DEFAULT_ERD_SELECTED_TABLES];

  const hasUnknown = normalized.some((table) => !hasKnownTableBlueprint(table));
  if (hasUnknown) return [...DEFAULT_ERD_SELECTED_TABLES];

  return normalized;
};
