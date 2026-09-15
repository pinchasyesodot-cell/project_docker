import { ClientSession, QueryFilter, Types } from "mongoose";
import { ISItem } from "../interfaces/Item.js";
import { ISupplier } from "../interfaces/Supplier.js";
import { Item } from "../models/Item.js";
import { CustomError } from "../interfaces/Error.js";
import { IOrderItemInput } from "../interfaces/Order.js";

const isPopulated = <T>(obj: T | Types.ObjectId | string): obj is T => {
    return obj !== null && typeof obj !== "string" && !(obj instanceof Types.ObjectId);
};

export const calculateOrderProfit = (itemsFromDB: ISItem[], orderItems: IOrderItemInput[]): number => {
    try {
        let total = 0;
        for (const orderItem of orderItems) {
            const item = itemsFromDB.find((dbItem) => dbItem._id!.toString() === orderItem.itemId.toString());
            if (item) {
                if (!isPopulated<ISupplier>(item.supplierId)) {
                    throw new Error(`Supplier data is missing. Did you forget to .populate('supplierId')?`);
                }
                const supplier = item.supplierId;
                const supplierItem = supplier.items.find((supplierItem) => supplierItem.itemName === item.name);
                if (!supplierItem) {
                    throw new Error(`Item ${item.name} not found in supplier ${supplier.name} catalog`);
                }
                const profitPerUnit = item.consumerPrice - supplierItem.price;
                total += profitPerUnit * orderItem.quantity;
            } else {
                throw new Error(`Item with ID ${orderItem.itemId} not found in database`);
            }
        }
        return total;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to fetch calculate Order Profit : ${errorMessage}`);
    }
};

export const validateStock = (itemsFromDB: ISItem[], orderItems: IOrderItemInput[]): void => {
    try {
        for (const orderItem of orderItems) {
            const item = itemsFromDB.find((dbItem) => dbItem._id!.toString() === orderItem.itemId.toString());
            if (!item) {
                const error = new Error(`Item with ID ${orderItem.itemId} not found`) as CustomError;
                error.statusCode = 404;
                throw error;
            }
            if (item.stock < orderItem.quantity) {
                const error = new Error(`Not enough stock for ${item.name}. Available: ${item.stock}`) as CustomError;
                error.statusCode = 400;
                throw error;
            }
        }
    } catch (error) {
        if ((error as CustomError).statusCode) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to fetch validate Stock: ${errorMessage}`);
    }
};

export const updateItemStock = async (
    itemId: string,
    quantityChange: number,
    session?: ClientSession
): Promise<void> => {
    try {
        if (quantityChange === 0) return;
        const itemExists = await Item.findById(itemId).session(session ? session : null);
        if (!itemExists) {
            throw new Error(`Item with ID ${itemId} not found`);
        }
        const updateQuery: QueryFilter<ISItem> = {
            _id: new Types.ObjectId(itemId),
            ...(quantityChange > 0 ? { stock: { $gte: quantityChange } } : {}),
        };
        const updateItem = await Item.findOneAndUpdate(
            updateQuery,
            { $inc: { stock: -quantityChange } },
            { new: true, session }
        );
        if (!updateItem) {
            throw new Error(`Not enough stock for item ${itemId}`);
        }
    } catch (error: unknown) {
        if (error instanceof Error && error.stack?.includes("updateItemStock")) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to update item stock: ${errorMessage}`);
    }
};

export const validateOrderRequirements = (orderItems: IOrderItemInput[]): void => {
    if (orderItems.some((item) => item.quantity <= 0)) {
        const error = new Error("Each item quantity must be a positive number") as CustomError;
        error.statusCode = 400;
        throw error;
    }
    const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQuantity > 50) {
        const error = new Error("Total quantity of items in an order cannot exceed 50") as CustomError;
        error.statusCode = 400;
        throw error;
    }
    if (orderItems.length > 10) {
        const error = new Error("An order cannot contain more than 10 different items") as CustomError;
        error.statusCode = 400;
        throw error;
    }
};

export const processOrderFinancials = async (orderItems: IOrderItemInput[]): Promise<number> => {
    try {
        validateOrderRequirements(orderItems);
        const itemIds = orderItems.map((item) => item.itemId.toString());
        const dbItems: ISItem[] = await Item.find({ _id: { $in: itemIds } })
            .populate("supplierId")
            .select("-__v")
            .lean() as unknown as ISItem[]
        validateStock(dbItems, orderItems);
        const totalProfit = calculateOrderProfit(dbItems, orderItems);
        return totalProfit;
    } catch (error: unknown) {
        if ((error as CustomError).statusCode) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to calculate order profit: ${errorMessage}`);
    }
};
