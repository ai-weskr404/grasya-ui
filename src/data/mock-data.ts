import type { LogEntry, FileNode } from "../types";

export const INITIAL_LOGS: LogEntry[] = [
  {
    id: 1,
    timestamp: "10:00:01",
    message: "System initialization started...",
    type: "info",
  },
  {
    id: 2,
    timestamp: "10:00:02",
    message: "Loading drivers: pg-native, mongodb-core, mongodb-driver",
    type: "info",
  },
  {
    id: 3,
    timestamp: "10:00:03",
    message: "Waiting for connection...",
    type: "info",
  },
];

export const DB_SCHEMA: FileNode[] = [
  {
    id: "pgsql",
    name: "PGSQL",
    type: "folder",
    isOpen: true,
    children: [
      {
        id: "pgsql-tables",
        name: "Tables",
        type: "folder",
        isOpen: true,
        children: [
          {
            id: "pgsql-system-tables",
            name: "System Tables",
            type: "folder",
            isOpen: true,
            children: [
              {
                id: "pgsql-customers",
                name: "public.customers",
                type: "table",
              },
              { id: "pgsql-products", name: "public.products", type: "table" },
              { id: "pgsql-orders", name: "public.orders", type: "table" },
              {
                id: "pgsql-order-items",
                name: "public.order_items",
                type: "table",
              },
              { id: "pgsql-payments", name: "public.payments", type: "table" },
              {
                id: "pgsql-inventory",
                name: "public.inventory",
                type: "table",
              },
              {
                id: "pgsql-shipping-logs",
                name: "public.shipping_logs",
                type: "table",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "mdb",
    name: "MDB",
    type: "folder",
    isOpen: true,
    children: [
      {
        id: "mdb-tables",
        name: "Tables",
        type: "folder",
        isOpen: true,
        children: [
          {
            id: "mdb-system-tables",
            name: "System Tables",
            type: "folder",
            isOpen: true,
            children: [
              { id: "mdb-customers", name: "public.customers", type: "table" },
              { id: "mdb-products", name: "public.products", type: "table" },
              { id: "mdb-orders", name: "public.orders", type: "table" },
              {
                id: "mdb-order-items",
                name: "public.order_items",
                type: "table",
              },
              { id: "mdb-payments", name: "public.payments", type: "table" },
              { id: "mdb-inventory", name: "public.inventory", type: "table" },
              {
                id: "mdb-shipping-logs",
                name: "_.public.shipping_logs",
                type: "table",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "mdba",
    name: "MDBA",
    type: "folder",
    isOpen: true,
    children: [
      {
        id: "mdba-cluster",
        name: "Cluster",
        type: "folder",
        isOpen: true,
        children: [],
      },
    ],
  },
];
