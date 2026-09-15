import { model, Schema } from "mongoose";
import { IOrder } from "../interfaces/Order.js";

const OrderSchema = new Schema<IOrder>({
    items: [
        {
            itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
            quantity: { type: Number, required: true, min: 1 },
            _id: false,
        },
    ],
    address: { type: String, required: true },
    orderDate: { type: Date, default: Date.now },
    shopProfit: { type: Number, required: true, min: 0 },
});

export const OrderModel = model<IOrder>("Order", OrderSchema);
