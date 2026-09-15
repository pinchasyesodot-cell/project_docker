import { Item } from "../models/Item.js";
import { ItemBase } from "../validations/item.validation.js";
import { ISItem, ISItemReturen } from "../interfaces/Item.js";
import { ISupplier, ISupplierItem } from "../interfaces/Supplier.js";
import { CustomError } from "../interfaces/Error.js";
import { SUPPLIER_MARKUP_FACTOR } from "../utils/constants.js";

export const createNewItem = async (itemData: ItemBase): Promise<ISItem> => {
    try {
        const newItem = new Item(itemData);
        return await newItem.save();
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to create new item: ${errorMessage}`);
    }
};

export const getAllItemsInDB = async (): Promise<ISItemReturen[] | null> => {
    try {
        const items = await Item.find()
            .populate({ path: "supplierId", select: "-__v -createdAt -updatedAt -items" })
            .select("-__v -createdAt -updatedAt")
            .lean<ISItem[]>();
        if (!items) return null;
        return items.map((item)=>{
            const {supplierId, ...itemData} = item as ISItem
            return {...itemData, supplier: supplierId as unknown as ISupplier}
        })
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to get All items: ${errorMessage}`);
    }
};

export const getItemByIdInDB = async (itemId: string): Promise<ISItemReturen | null> => {
    try {
        const item = await Item.findById(itemId)
            .populate({ path: "supplierId", select: "-__v -createdAt -updatedAt -items" })
            .select("-__v -createdAt -updatedAt")
            .lean();
        if (!item) return null;
        const { supplierId, ...itemData } = item as ISItem;
        return { ...itemData, supplier: supplierId as unknown as ISupplier };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to get item by id: ${errorMessage}`);
    }
};

export const verifyProfitMargin = (item: { name: string; supplier: ISupplier }, newPrice: number): void => {
    try {
        const supplier = item.supplier;
        if (!supplier || !supplier.items || !Array.isArray(supplier.items)) {
            throw new Error(`Supplier data or items for ${item.name} are missing.`);
        }
        const supplierItem = supplier.items.find((si: ISupplierItem) => si.itemName.trim() === item.name.trim());
        if (!supplierItem) {
            throw new Error(`Item ${item.name} not found in supplier's catalog`);
        }
        const minPrice = supplierItem.price * SUPPLIER_MARKUP_FACTOR;
        if (newPrice < minPrice) {
            throw new Error(
                `Price too low. According to store rules, price must be at least 30% above supplier price (${minPrice.toFixed(2)})`
            );
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to verify Profit Margin item: ${errorMessage}`);
    }
};

export const updateItemInDB = async (id: string, updateData: Partial<ItemBase>): Promise<ISItem | null> => {
    try {
        const updatedItem = await Item.findByIdAndUpdate(id, updateData, { returnDocument: "after" });
        if (!updatedItem) {
            const error = new Error("Item not found") as CustomError;
            error.statusCode = 404;
            throw error;
        }
        return updatedItem;
    } catch (error: unknown) {
        if ((error as CustomError).statusCode === 404) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to update item: ${errorMessage}`);
    }
};

export const deleteItemById = async (itemId: string): Promise<void> => {
    try {
        await Item.deleteOne({ _id: itemId });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to delete item: ${errorMessage}`);
    }
};
