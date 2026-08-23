/** Shared API types aligned with docs/openapi.json */

export interface ApiErrorBody {
  message: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: PaginationMeta;
}

export type UserRole = "Admin" | "Pharmacist";
export type UserStatus = "Active" | "Inactive";

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string | null;
  role: UserRole | string;
  phone?: string | null;
  status?: UserStatus | string;
  avatarUrl?: string | null;
  dateJoined?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface HealthResponse {
  status: string;
  service: string;
  currency: string;
  vatRate: number;
}

export type ProductStatus = "Active" | "Inactive";

export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  manufacturer: string;
  price: string;
  stock: number;
  status: ProductStatus;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  batchNo: string;
  stock: number;
  minStock: number;
  maxStock?: number;
  expiryDate: string;
  isExpiringSoon?: boolean;
  unitPrice: string;
}

export type AdjustmentType =
  | "Expired"
  | "Inventory Count"
  | "Damaged"
  | "Theft / Lost"
  | "Return to Supplier";

export type AdjustmentStatus = "Completed" | "Pending Review";

export interface Adjustment {
  id: string;
  date: string;
  productName: string;
  sku: string;
  type: AdjustmentType;
  qtyChange: number;
  adjustedBy: string;
  status: AdjustmentStatus;
  reason?: string;
}

export interface SupplierContact {
  name?: string;
  email?: string;
  phone?: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: "Medications" | "Medical Supplies" | "Equipment" | "Diagnostics" | string;
  contact?: SupplierContact;
  address?: string;
  rating?: number;
  status?: "Active" | "Inactive";
}

export type PurchaseOrderStatus =
  | "DRAFT"
  | "PENDING"
  | "SHIPPED"
  | "RECEIVED"
  | "CANCELLED";

export interface PurchaseOrder {
  id: string;
  supplier: {
    name: string;
    avatar?: string;
  };
  dateOrdered: string;
  expectedDelivery: string;
  isDelayed?: boolean;
  total: string;
  status: PurchaseOrderStatus;
}

export interface PosProduct {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  stockUnit?: string;
}

export interface SaleLineItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

export type PaymentMethod = "cash" | "telebirr" | "card";

export interface SaleCheckoutRequest {
  customerName?: string;
  items: SaleLineItem[];
  paymentMethod: PaymentMethod;
  amountTendered?: number;
  notes?: string;
}

export interface SaleCheckoutResponse {
  message: string;
  invoiceNumber: string;
  subtotal: number;
  vat: number;
  total: number;
  changeDue: number;
  paymentMethod: string;
}

export type InvoicePaymentMethod = "Cash" | "Card" | "Bank Transfer" | "Telebirr";
export type InvoiceStatus = "Paid" | "Pending" | "Overdue" | "Cancelled";

export interface Invoice {
  id: string;
  customerName: string;
  date: string;
  amount: string;
  paymentMethod: InvoicePaymentMethod;
  status: InvoiceStatus;
}

export interface DashboardStats {
  todaySales: number;
  totalProducts: number;
  lowStockCount: number;
  expiringSoonCount: number;
}

export interface Dashboard {
  stats: DashboardStats;
  salesOverview?: Record<string, unknown>;
  recentSales?: Record<string, unknown>[];
  expiryAlerts?: Record<string, unknown>[];
  lowStockAlerts?: Record<string, unknown>[];
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  employeeId: string;
  email?: string;
}
