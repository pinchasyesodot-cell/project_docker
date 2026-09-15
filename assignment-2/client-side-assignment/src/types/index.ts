export interface Item {
    _id: string;
    name: string;
    consumerPrice?: number;
    stock: number;
    category: string;
    supplier?: Supplier;
    supplierId?: string;
    image?: string;
    description?: string;
}

export interface SupplierItem {
    itemName: string;
    price: number;
}

export interface Supplier {
    _id: string;
    name: string;
    items: SupplierItem[];
}

export interface OrderItem {
    item?: string | Item;
    itemId: string;
    price: number;
    quantity: number;
}

export interface Order {
    _id?: string;
    items: OrderItem[];
    address: string;
    orderDate?: string;
    shopProfit?: number;
}

export interface AnalyticsRevenue {
    revenue: number;
}

export interface AnalyticsCategory {
    _id: string;
    totalProfit: number;
}

export interface AnalyticsTopItem {
    _id: string;
    name: string;
    profit: number;
}

export interface AnalyticsMargins {
    highest: { _id: string; name: string; margin: number };
    lowest: { _id: string; name: string; margin: number };
}

export interface AnalyticsTopSupplier {
    _id: string;
    totalProfit: number;
}

export interface AnalyticsSupplierSpent {
    supplier: Supplier;
    spent: number;
}

export interface CartItem extends Item {
    quantity: number;
}
