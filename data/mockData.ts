
import { Product, Purchase, Sale, Gender, DocumentType, Adjustment, Customer } from '../types';

// New products based on user's initial inventory with brands
export const mockProducts: Product[] = [
  { id: '10001', name: 'ECLAIRE EDP 100 ML', brand: 'Lattafa', gender: Gender.FEMALE, stock: 2, testerStock: 0, costPrice: 24990, salePrice: 40000 },
  { id: '10002', name: 'NOW WOMEN EDP 100ML', brand: 'Rave', gender: Gender.FEMALE, stock: 2, testerStock: 0, costPrice: 19990, salePrice: 35000 },
  { id: '10003', name: 'BIG PONY 2 PINK EDT 100ml', brand: 'Ralph Lauren', gender: Gender.FEMALE, stock: 1, testerStock: 0, costPrice: 29990, salePrice: 45000 },
  { id: '10004', name: 'PRIDE WINNERS TROPHY SILVER EDP 100 ML', brand: 'Lattafa', gender: Gender.MALE, stock: 2, testerStock: 0, costPrice: 27990, salePrice: 45000 },
  { id: '10005', name: 'CHAMPION G.O.A.T EDP 80ML', brand: 'Fragrance World', gender: Gender.MALE, stock: 3, testerStock: 0, costPrice: 19990, salePrice: 35000 },
  { id: '10006', name: 'JORGE DI PROFUMO AQUA EDP 100ML', brand: 'Maison Alhambra', gender: Gender.MALE, stock: 1, testerStock: 0, costPrice: 15990, salePrice: 30000 },
  { id: '10007', name: 'LIAM BLUE SHINE EDP 100ML', brand: 'Lattafa', gender: Gender.MALE, stock: 1, testerStock: 0, costPrice: 23990, salePrice: 40000 },
  { id: '10008', name: 'TOMMY GIRL EDT 100ML', brand: 'Tommy Hilfiger', gender: Gender.FEMALE, stock: 1, testerStock: 0, costPrice: 24990, salePrice: 42000 },
  { id: '10009', name: 'MAYAR NATURAL INTENSE EDP 100ML', brand: 'Lattafa', gender: Gender.FEMALE, stock: 1, testerStock: 0, costPrice: 26990, salePrice: 45000 },
];

// New purchases reflecting the initial stock
export const mockPurchases: Purchase[] = [
    { id: 'p_init_1', productId: '10001', date: '2025-09-11', quantity: 2, unitCost: 24990, supplier: 'PROVEEDOR INICIAL', documentType: DocumentType.FACTURA, documentNumber: 'F-001' },
    { id: 'p_init_2', productId: '10002', date: '2025-09-11', quantity: 2, unitCost: 19990, supplier: 'PROVEEDOR INICIAL', documentType: DocumentType.FACTURA, documentNumber: 'F-001' },
    { id: 'p_init_3', productId: '10003', date: '2025-09-11', quantity: 1, unitCost: 29990, supplier: 'PROVEEDOR INICIAL', documentType: DocumentType.FACTURA, documentNumber: 'F-001' },
    { id: 'p_init_4', productId: '10004', date: '2025-09-11', quantity: 2, unitCost: 27990, supplier: 'PROVEEDOR INICIAL', documentType: DocumentType.FACTURA, documentNumber: 'F-001' },
    { id: 'p_init_5', productId: '10005', date: '2025-09-11', quantity: 3, unitCost: 19990, supplier: 'PROVEEDOR INICIAL', documentType: DocumentType.FACTURA, documentNumber: 'F-001' },
    { id: 'p_init_6', productId: '10006', date: '2025-09-11', quantity: 1, unitCost: 15990, supplier: 'PROVEEDOR INICIAL', documentType: DocumentType.FACTURA, documentNumber: 'F-001' },
    { id: 'p_init_7', productId: '10007', date: '2025-09-11', quantity: 1, unitCost: 23990, supplier: 'PROVEEDOR INICIAL', documentType: DocumentType.FACTURA, documentNumber: 'F-001' },
    { id: 'p_init_8', productId: '10008', date: '2025-09-11', quantity: 1, unitCost: 24990, supplier: 'PROVEEDOR INICIAL', documentType: DocumentType.FACTURA, documentNumber: 'F-001' },
    { id: 'p_init_9', productId: '10009', date: '2025-09-11', quantity: 1, unitCost: 26990, supplier: 'PROVEEDOR INICIAL', documentType: DocumentType.FACTURA, documentNumber: 'F-001' },
];

// No initial sales as requested
export const mockSales: Sale[] = [];
export const mockAdjustments: Adjustment[] = [];
export const mockCustomers: Customer[] = [];