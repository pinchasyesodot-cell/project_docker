import { Types } from "mongoose";
import { ISupplier } from "../validations/supplier.validation.js";

export interface ISItem {
    _id: Types.ObjectId;
    name: string;
    consumerPrice: number;
    stock: number;
    category: string;
    supplierId: Types.ObjectId;
}

export interface ISItemReturen {
    _id: Types.ObjectId;
    name: string;
    consumerPrice: number;
    stock: number;
    category: string;
    supplier:ISupplier ;
}
