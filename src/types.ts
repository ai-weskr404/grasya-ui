export interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'table' | 'view' | 'proc';
  children?: FileNode[];
  isOpen?: boolean;
}

export type TrafficState = 'BLUE_POSTGRES' | 'GREEN_MONGO';

export interface SalesOrderHeader {
  SalesOrderID: number;
  RevisionNumber: number;
  OrderDate: string;
  DueDate: string;
  ShipDate: string | null;
  Status: number;
  OnlineOrderFlag: boolean;
  SalesOrderNumber: string;
  PurchaseOrderNumber: string | null;
  AccountNumber: string | null;
  CustomerID: number;
  SalesPersonID: number | null;
  TerritoryID: number | null;
  BillToAddressID: number;
  ShipToAddressID: number;
  ShipMethodID: number;
  CreditCardID: number | null;
  CreditCardApprovalCode: string | null;
  CurrencyRateID: number | null;
  TaxAmt: number;
  Freight: number;
  TotalDue: number;
  Comment: string | null;
  rowguid: string;
  ModifiedDate: string;
}

export interface SalesOrderDetail {
  SalesOrderID: number;
  SalesOrderDetailID: number;
  CarrierTrackingNumber: string | null;
  OrderQty: number;
  ProductID: number;
  SpecialOfferID: number;
  UnitPrice: number;
  UnitPriceDiscount: number;
  LineTotal: number;
  rowguid: string;
  ModifiedDate: string;
}

export interface SalesOrderHeaderSalesReason {
  SalesOrderID: number;
  SalesReasonID: number;
  ModifiedDate: string;
}
