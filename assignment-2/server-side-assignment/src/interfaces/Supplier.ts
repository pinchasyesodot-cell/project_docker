import { Types } from "mongoose";

export interface ISupplierItem {
    _id: Types.ObjectId;
    itemName: string;
    price: number;
}

export interface ISupplier {
    _id: Types.ObjectId;
    name: string;
    items: ISupplierItem[];
}
