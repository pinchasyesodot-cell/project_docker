import { Schema, UpdateQuery, model } from "mongoose";
import { ISupplier } from "../interfaces/Supplier.js";
import { SUPPLIER_MARKUP_FACTOR } from "../utils/constants.js";

const SupplierSchema = new Schema<ISupplier>(
    {
        name: { type: String, required: true, unique: true, index: true },
        items: [
            {
                itemName: { type: String, required: true },
                price: { type: Number, required: true, min: 0 },
            },
        ],
    },
    { timestamps: true }
);

SupplierSchema.pre("findOneAndUpdate", async function () {
    try {
        const update = this.getUpdate() as UpdateQuery<ISupplier>;
        const items = update.$set?.items || update.items;
        if (!Array.isArray(items)) return;
        const supplierId = this.getQuery()._id;
        const ItemModel = model("Item");
        const operations = items.map((item) => ({
            updateOne: {
                filter: { name: item.itemName, supplierId: supplierId },
                update: {
                    $set: {
                        consumerPrice: item.price * SUPPLIER_MARKUP_FACTOR,
                    },
                    $setOnInsert: {
                        stock: 0,
                        category: "כללי",
                    },
                },
                upsert: true,
            },
        }));
        await ItemModel.bulkWrite(operations);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error(`Failed to update items for supplier: ${errorMessage}`);
        throw error;
    }
});

export const Supplier = model<ISupplier>("Supplier", SupplierSchema);
