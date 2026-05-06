import type{
  LogEntry,
  FileNode,
  SalesOrderHeader,
  SalesOrderDetail,
  SalesOrderHeaderSalesReason,
} from '../types';

export const INITIAL_LOGS: LogEntry[] = [
  { id: 1, timestamp: '10:00:01', message: 'System initialization started...', type: 'info' },
  { id: 2, timestamp: '10:00:02', message: 'Loading drivers: pg-native, mongodb-core, mongodb-driver', type: 'info' },
  { id: 3, timestamp: '10:00:03', message: 'Waiting for connection...', type: 'info' },
];

export const DB_SCHEMA: FileNode[] = [
  {
    id: 'src', name: 'SRC_POSTGRES (Primary)', type: 'folder', isOpen: true, children: [
      { id: 's1', name: 'public', type: 'folder', isOpen: true, children: [
        { id: 't1', name: 'users', type: 'table' },
        { id: 't2', name: 'transactions', type: 'table' },
        { id: 't3', name: 'inventory_items', type: 'table' },
      ]},
      { id: 's2', name: 'catalog', type: 'folder', children: [] }
    ]
  },
  {
    id: 'tgt', name: 'TGT_MONGO (Atlas Cluster)', type: 'folder', isOpen: true, children: [
       { id: 'c1', name: 'grasya_analytics', type: 'folder', isOpen: true, children: [
          { id: 'd1', name: 'users_v2', type: 'view' },
          { id: 'd2', name: 'daily_tx_agg', type: 'view' }
       ] }
    ]
  },
  {
    id: 'cld', name: 'MongoDB_Storage (Archive)', type: 'folder', children: [
       { id: 'b1', name: 'storage-grasya-prod', type: 'folder', children: [] }
    ]
  }
];

export const SALES_ORDER_HEADERS: SalesOrderHeader[] = [
  {
    SalesOrderID: 43659, RevisionNumber: 8, OrderDate: '2013-05-31', DueDate: '2013-06-12', ShipDate: '2013-06-07',
    Status: 5, OnlineOrderFlag: true, SalesOrderNumber: 'SO43659', PurchaseOrderNumber: 'PO522145787',
    AccountNumber: '10-4020-000676', CustomerID: 29825, SalesPersonID: 279, TerritoryID: 5, BillToAddressID: 985,
    ShipToAddressID: 985, ShipMethodID: 5, CreditCardID: 16281, CreditCardApprovalCode: '105041Vi84182',
    CurrencyRateID: null, TaxAmt: 70.4279, Freight: 22.0087, TotalDue: 2818.3754, Comment: null,
    rowguid: '79B65321-39CA-4115-9CBA-8FE0903E12E6', ModifiedDate: '2013-06-07',
  },
  {
    SalesOrderID: 43660, RevisionNumber: 8, OrderDate: '2013-05-31', DueDate: '2013-06-12', ShipDate: '2013-06-07',
    Status: 5, OnlineOrderFlag: true, SalesOrderNumber: 'SO43660', PurchaseOrderNumber: 'PO18850127500',
    AccountNumber: '10-4020-000117', CustomerID: 29672, SalesPersonID: 279, TerritoryID: 5, BillToAddressID: 921,
    ShipToAddressID: 921, ShipMethodID: 5, CreditCardID: 5618, CreditCardApprovalCode: '115213Vi29411',
    CurrencyRateID: null, TaxAmt: 16.994, Freight: 5.3106, TotalDue: 678.3911, Comment: null,
    rowguid: '738DC42D-D03B-48A1-9822-F95A67EA7389', ModifiedDate: '2013-06-07',
  },
];

export const SALES_ORDER_DETAILS: SalesOrderDetail[] = [
  { SalesOrderID: 43659, SalesOrderDetailID: 1, CarrierTrackingNumber: '4911-403C-98', OrderQty: 1, ProductID: 776, SpecialOfferID: 1, UnitPrice: 2024.994, UnitPriceDiscount: 0, LineTotal: 2024.994, rowguid: 'B207C96D-D9E6-402B-8470-2CC176C42283', ModifiedDate: '2013-06-07' },
  { SalesOrderID: 43659, SalesOrderDetailID: 2, CarrierTrackingNumber: '4911-403C-98', OrderQty: 3, ProductID: 777, SpecialOfferID: 1, UnitPrice: 2024.994, UnitPriceDiscount: 0, LineTotal: 6074.982, rowguid: '7ABB600D-1C36-48FE-B3E7-4C85A2D8A7E8', ModifiedDate: '2013-06-07' },
  { SalesOrderID: 43660, SalesOrderDetailID: 1, CarrierTrackingNumber: '6431-4D57-83', OrderQty: 1, ProductID: 762, SpecialOfferID: 1, UnitPrice: 419.4589, UnitPriceDiscount: 0, LineTotal: 419.4589, rowguid: '1E77994F-72C7-4E6D-89D6-5C11D2F6B7D6', ModifiedDate: '2013-06-07' },
];

export const SALES_ORDER_HEADER_SALES_REASONS: SalesOrderHeaderSalesReason[] = [
  { SalesOrderID: 43659, SalesReasonID: 5, ModifiedDate: '2013-06-07' },
  { SalesOrderID: 43659, SalesReasonID: 11, ModifiedDate: '2013-06-07' },
  { SalesOrderID: 43660, SalesReasonID: 1, ModifiedDate: '2013-06-07' },
];
