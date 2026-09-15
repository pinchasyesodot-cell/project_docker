import { Schema, Types } from "mongoose";
import { OrderBase } from "../validations/order.validation.js";
export interface IOrderItem {
    itemId: Schema.Types.ObjectId;
    quantity: number;
}
export interface IOrder extends Omit<OrderBase, "items"> {
    _id?: Schema.Types.ObjectId;
    items: IOrderItem[];
    orderDate: Date;
}

export interface IOrderItemInput {
    itemId: string | Types.ObjectId;
    quantity: number;
}
