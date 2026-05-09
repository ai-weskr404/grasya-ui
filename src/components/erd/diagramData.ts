import type { TableDef } from "./types";

export const DEFAULT_ERD_SELECTED_TABLES = [
  "core.users",
  "core.user_profiles",
  "org.organizations",
  "org.departments",
  "auth.roles",
  "auth.user_roles",
  "pm.projects",
  "pm.project_members",
  "pm.tasks",
  "pm.task_comments",
  "files.files",
  "pm.task_attachments",
  "core.notifications",
  "core.audit_logs",
  "billing.billing_accounts",
  "billing.invoices",
  "billing.payments",
  "pm.tags",
  "pm.task_tags",
  "core.messages",
  "auth.api_keys",
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
  users: { schema: "core", columns: [
    { name: "user_id", type: "uuid", isPrimary: true, notNull: true },
    { name: "username", type: "varchar", notNull: true },
    { name: "email", type: "varchar", notNull: true },
    { name: "password_hash", type: "varchar", notNull: true },
    { name: "created_at", type: "timestamp", notNull: true },
    { name: "is_active", type: "boolean", notNull: true },
  ]},
  user_profiles: { schema: "core", columns: [
    { name: "profile_id", type: "uuid", isPrimary: true, notNull: true },
    { name: "user_id", type: "uuid", notNull: true },
    { name: "first_name", type: "varchar" },{ name: "last_name", type: "varchar" },{ name: "avatar_url", type: "varchar" },{ name: "bio", type: "text" },{ name: "birth_date", type: "date" },
  ], relationships:[{fkColumn:"user_id",referencesSchema:"core",referencesTable:"users",referencesColumn:"user_id"}]},
  organizations:{schema:"org",columns:[{name:"organization_id",type:"uuid",isPrimary:true,notNull:true},{name:"organization_name",type:"varchar",notNull:true},{name:"industry",type:"varchar"},{name:"created_at",type:"timestamp",notNull:true}]},
  departments:{schema:"org",columns:[{name:"department_id",type:"uuid",isPrimary:true,notNull:true},{name:"organization_id",type:"uuid",notNull:true},{name:"parent_department_id",type:"uuid"},{name:"department_name",type:"varchar",notNull:true}],relationships:[{fkColumn:"organization_id",referencesSchema:"org",referencesTable:"organizations",referencesColumn:"organization_id"},{fkColumn:"parent_department_id",referencesSchema:"org",referencesTable:"departments",referencesColumn:"department_id"}]},
  roles:{schema:"auth",columns:[{name:"role_id",type:"uuid",isPrimary:true,notNull:true},{name:"role_name",type:"varchar",notNull:true},{name:"description",type:"text"}]},
  user_roles:{schema:"auth",columns:[{name:"user_id",type:"uuid",notNull:true},{name:"role_id",type:"uuid",notNull:true},{name:"assigned_at",type:"timestamp",notNull:true}],relationships:[{fkColumn:"user_id",referencesSchema:"core",referencesTable:"users",referencesColumn:"user_id"},{fkColumn:"role_id",referencesSchema:"auth",referencesTable:"roles",referencesColumn:"role_id"}]},
  projects:{schema:"pm",columns:[{name:"project_id",type:"uuid",isPrimary:true,notNull:true},{name:"organization_id",type:"uuid",notNull:true},{name:"owner_user_id",type:"uuid",notNull:true},{name:"project_name",type:"varchar",notNull:true},{name:"description",type:"text"},{name:"created_at",type:"timestamp",notNull:true},{name:"status",type:"varchar",notNull:true}],relationships:[{fkColumn:"organization_id",referencesSchema:"org",referencesTable:"organizations",referencesColumn:"organization_id"},{fkColumn:"owner_user_id",referencesSchema:"core",referencesTable:"users",referencesColumn:"user_id"}]},
  project_members:{schema:"pm",columns:[{name:"project_id",type:"uuid",notNull:true},{name:"user_id",type:"uuid",notNull:true},{name:"member_role",type:"varchar",notNull:true},{name:"joined_at",type:"timestamp",notNull:true}],relationships:[{fkColumn:"project_id",referencesSchema:"pm",referencesTable:"projects",referencesColumn:"project_id"},{fkColumn:"user_id",referencesSchema:"core",referencesTable:"users",referencesColumn:"user_id"}]},
  tasks:{schema:"pm",columns:[{name:"task_id",type:"uuid",isPrimary:true,notNull:true},{name:"project_id",type:"uuid",notNull:true},{name:"assigned_to",type:"uuid"},{name:"parent_task_id",type:"uuid"},{name:"title",type:"varchar",notNull:true},{name:"description",type:"text"},{name:"priority",type:"varchar"},{name:"status",type:"varchar",notNull:true},{name:"due_date",type:"timestamp"}],relationships:[{fkColumn:"project_id",referencesSchema:"pm",referencesTable:"projects",referencesColumn:"project_id"},{fkColumn:"assigned_to",referencesSchema:"core",referencesTable:"users",referencesColumn:"user_id"},{fkColumn:"parent_task_id",referencesSchema:"pm",referencesTable:"tasks",referencesColumn:"task_id"}]},
  task_comments:{schema:"pm",columns:[{name:"comment_id",type:"uuid",isPrimary:true,notNull:true},{name:"task_id",type:"uuid",notNull:true},{name:"user_id",type:"uuid",notNull:true},{name:"comment_body",type:"text",notNull:true},{name:"created_at",type:"timestamp",notNull:true}],relationships:[{fkColumn:"task_id",referencesSchema:"pm",referencesTable:"tasks",referencesColumn:"task_id"},{fkColumn:"user_id",referencesSchema:"core",referencesTable:"users",referencesColumn:"user_id"}]},
  files:{schema:"files",columns:[{name:"file_id",type:"uuid",isPrimary:true,notNull:true},{name:"uploaded_by",type:"uuid",notNull:true},{name:"file_name",type:"varchar",notNull:true},{name:"mime_type",type:"varchar",notNull:true},{name:"file_size",type:"int",notNull:true},{name:"uploaded_at",type:"timestamp",notNull:true}],relationships:[{fkColumn:"uploaded_by",referencesSchema:"core",referencesTable:"users",referencesColumn:"user_id"}]},
  task_attachments:{schema:"pm",columns:[{name:"task_id",type:"uuid",notNull:true},{name:"file_id",type:"uuid",notNull:true},{name:"attached_at",type:"timestamp",notNull:true}],relationships:[{fkColumn:"task_id",referencesSchema:"pm",referencesTable:"tasks",referencesColumn:"task_id"},{fkColumn:"file_id",referencesSchema:"files",referencesTable:"files",referencesColumn:"file_id"}]},
  notifications:{schema:"core",columns:[{name:"notification_id",type:"uuid",isPrimary:true,notNull:true},{name:"user_id",type:"uuid",notNull:true},{name:"notification_type",type:"varchar",notNull:true},{name:"message",type:"text",notNull:true},{name:"is_read",type:"boolean",notNull:true},{name:"created_at",type:"timestamp",notNull:true}],relationships:[{fkColumn:"user_id",referencesSchema:"core",referencesTable:"users",referencesColumn:"user_id"}]},
  audit_logs:{schema:"core",columns:[{name:"audit_id",type:"uuid",isPrimary:true,notNull:true},{name:"user_id",type:"uuid"},{name:"entity_name",type:"varchar",notNull:true},{name:"action_type",type:"varchar",notNull:true},{name:"old_value",type:"text"},{name:"new_value",type:"text"},{name:"created_at",type:"timestamp",notNull:true}],relationships:[{fkColumn:"user_id",referencesSchema:"core",referencesTable:"users",referencesColumn:"user_id"}]},
  billing_accounts:{schema:"billing",columns:[{name:"billing_account_id",type:"uuid",isPrimary:true,notNull:true},{name:"organization_id",type:"uuid",notNull:true},{name:"subscription_plan",type:"varchar",notNull:true},{name:"monthly_cost",type:"decimal",notNull:true},{name:"started_at",type:"timestamp",notNull:true}],relationships:[{fkColumn:"organization_id",referencesSchema:"org",referencesTable:"organizations",referencesColumn:"organization_id"}]},
  invoices:{schema:"billing",columns:[{name:"invoice_id",type:"uuid",isPrimary:true,notNull:true},{name:"billing_account_id",type:"uuid",notNull:true},{name:"amount",type:"decimal",notNull:true},{name:"issued_at",type:"timestamp",notNull:true},{name:"due_date",type:"timestamp",notNull:true},{name:"payment_status",type:"varchar",notNull:true}],relationships:[{fkColumn:"billing_account_id",referencesSchema:"billing",referencesTable:"billing_accounts",referencesColumn:"billing_account_id"}]},
  payments:{schema:"billing",columns:[{name:"payment_id",type:"uuid",isPrimary:true,notNull:true},{name:"invoice_id",type:"uuid",notNull:true},{name:"amount_paid",type:"decimal",notNull:true},{name:"payment_method",type:"varchar",notNull:true},{name:"paid_at",type:"timestamp"}],relationships:[{fkColumn:"invoice_id",referencesSchema:"billing",referencesTable:"invoices",referencesColumn:"invoice_id"}]},
  tags:{schema:"pm",columns:[{name:"tag_id",type:"uuid",isPrimary:true,notNull:true},{name:"tag_name",type:"varchar",notNull:true},{name:"color",type:"varchar"}]},
  task_tags:{schema:"pm",columns:[{name:"task_id",type:"uuid",notNull:true},{name:"tag_id",type:"uuid",notNull:true}],relationships:[{fkColumn:"task_id",referencesSchema:"pm",referencesTable:"tasks",referencesColumn:"task_id"},{fkColumn:"tag_id",referencesSchema:"pm",referencesTable:"tags",referencesColumn:"tag_id"}]},
  messages:{schema:"core",columns:[{name:"message_id",type:"uuid",isPrimary:true,notNull:true},{name:"sender_id",type:"uuid",notNull:true},{name:"receiver_id",type:"uuid",notNull:true},{name:"message_body",type:"text",notNull:true},{name:"sent_at",type:"timestamp",notNull:true}],relationships:[{fkColumn:"sender_id",referencesSchema:"core",referencesTable:"users",referencesColumn:"user_id"},{fkColumn:"receiver_id",referencesSchema:"core",referencesTable:"users",referencesColumn:"user_id"}]},
  api_keys:{schema:"auth",columns:[{name:"api_key_id",type:"uuid",isPrimary:true,notNull:true},{name:"user_id",type:"uuid",notNull:true},{name:"api_key",type:"varchar",notNull:true},{name:"expires_at",type:"timestamp"},{name:"revoked",type:"boolean",notNull:true}],relationships:[{fkColumn:"user_id",referencesSchema:"core",referencesTable:"users",referencesColumn:"user_id"}]},
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
        referencesTable: relationshipByColumn.get(col.name)?.referencesTable,
        referencesColumn: relationshipByColumn.get(col.name)?.referencesColumn,
      })),
    };
  });
};
