export enum Gender {
  MALE = 'HOMBRE',
  FEMALE = 'MUJER',
  UNISEX = 'UNISEX'
}

export enum DocumentType {
  FACTURA = 'FACTURA',
  BOLETA = 'BOLETA',
  GUIA_DESPACHO = 'GUIA DE DESPACHO',
  OTRO = 'OTRO'
}

export enum AdjustmentType {
  TESTER_CONVERSION = 'CONVERSION_TESTER',
  TESTER_CONSUMED = 'CONSUMO_TESTER'
}

export interface Product {
  id: string; // SKU
  name: string;
  brand: string;
  gender: Gender;
  stock: number;
  testerStock: number;
  costPrice: number;
  salePrice: number;
}

export interface Purchase {
  id: string;
  productId: string; // SKU
  date: string;
  quantity: number;
  unitCost: number;
  supplier: string;
  documentType: DocumentType;
  documentNumber: string;
}

export interface Sale {
  id: string;
  productId: string; // SKU
  date: string;
  quantity: number;
  unitPrice: number;
  total: number;
  customerId?: string;
}

export interface Adjustment {
  id: string;
  productId: string;
  date: string;
  type: AdjustmentType;
  quantity: number;
  cost: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
}