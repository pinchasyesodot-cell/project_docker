import { model, Schema } from "mongoose";
import { ISItem } from "../interfaces/Item.js";

const ItemSchema = new Schema<ISItem>(
    {
        name: { type: String, required: true },
        consumerPrice: { type: Number, required: true, min: 0 },
        stock: { type: Number, required: true, min: 0 },
        category: { type: String, required: true },
        supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
    },
    { timestamps: true }
);

ItemSchema.index({ name: 1, supplierId: 1 }, { unique: true });

export const Item = model<ISItem>("Item", ItemSchema);
