import { AnyBulkWriteOperation, ClientSession, Types, startSession } from "mongoose";
import { CustomError } from "../interfaces/Error.js";
import { IOrder, IOrderItemInput } from "../interfaces/Order.js";
import { OrderModel } from "../models/Order.js";
import { processOrderFinancials, updateItemStock } from "../utils/orderHelpers.js";
import { OrderBase } from "../validations/order.validation.js";
import { Item } from "../models/Item.js";
import { ISItem } from "../interfaces/Item.js";

export const processNewOrder = async (orderData: OrderBase | IOrder): Promise<IOrder> => {
    const session = await startSession();
    session.startTransaction();
    try {
        const itemsForValidation: IOrderItemInput[] = orderData.items.map((item) => ({
            itemId: item.itemId.toString(),
            quantity: item.quantity,
        }));
        const totalProfit = await processOrderFinancials(itemsForValidation);
        const finalOrder = new OrderModel({
            ...orderData,
            shopProfit: totalProfit,
        });
        const savedOrder = await finalOrder.save({ session });
        for (const orderItem of orderData.items) {
            await updateItemStock(orderItem.itemId.toString(), orderItem.quantity, session);
        }
        await session.commitTransaction();
        return savedOrder;
    } catch (error: unknown) {
        await session.abortTransaction();
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to fetch order: ${errorMessage}`);
    } finally {
        session.endSession();
    }
};

export const getAllOrdersInDB = async (): Promise<IOrder[]> => {
    try {
        const orders = await OrderModel.find().select("-__v").lean() as unknown as IOrder[];
        return orders;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to get all order: ${errorMessage}`);
    }
};

export const getOrderById = async (orderId: string): Promise<IOrder | null> => {
    try {
        const order = await OrderModel.findById(orderId).select("-__v").lean();
        if (!order) {
            return null;
        }
        return order;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to get order by ID: ${errorMessage}`);
    }
};

export const updateOrderInDB = async (orderId: string, orderData: OrderBase): Promise<IOrder | null> => {
    const session = await startSession();
    session.startTransaction();
    try {
        const existingOrder = await OrderModel.findById(orderId).session(session).lean();
        if (!existingOrder) {
            const error = new Error(`Order with ID ${orderId} not found`) as CustomError;
            error.statusCode = 404;
            throw error;
        }
        for (const newItem of orderData.items) {
            const oldItem = existingOrder.items.find((item) => item.itemId.toString() === newItem.itemId.toString());
            const quantityDiff = oldItem ? newItem.quantity - oldItem.quantity : newItem.quantity;
            if (quantityDiff !== 0) {
                await updateItemStock(newItem.itemId.toString(), quantityDiff, session);
            }
        }
        for (const oldItem of existingOrder.items) {
            const stillExists = orderData.items.find(
                (newItem) => newItem.itemId.toString() === oldItem.itemId.toString()
            );
            if (!stillExists) {
                await updateItemStock(oldItem.itemId.toString(), -oldItem.quantity, session);
            }
        }
        const totalProfit = await processOrderFinancials(orderData.items);
        const updateData = {
            ...orderData,
            shopProfit: totalProfit,
            items: orderData.items.map((item) => ({
                ...item,
                itemId: new Types.ObjectId(item.itemId),
            })),
        };
        const updatedOrder = (await OrderModel.findByIdAndUpdate(orderId, updateData, {
            new: true,
            runValidators: true,
            session,
        })
            .select("-__v")
            .lean()) as IOrder | null;
        await session.commitTransaction();
        return updatedOrder;
    } catch (error: unknown) {
        await session.abortTransaction();
        if ((error as CustomError).statusCode) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to update order: ${errorMessage}`);
    } finally {
        session.endSession();
    }
};

export const deleteOrderById = async (orderId: string): Promise<IOrder | null> => {
    const session: ClientSession = await OrderModel.startSession();
    try {
        let deletedOrder: IOrder | null = null;
        await session.withTransaction(async () => {
            deletedOrder = await OrderModel.findByIdAndDelete(orderId).session(session).lean();
            if (!deletedOrder) {
                const error = new Error(`Order with ID ${orderId} not found`) as CustomError;
                error.statusCode = 404;
                throw error;
            }
            const bulkOps: AnyBulkWriteOperation<ISItem>[] = deletedOrder.items.map((item) => ({
                updateOne: {
                    filter: { _id: item.itemId as unknown as Types.ObjectId },
                    update: { $inc: { stock: item.quantity } },
                },
            }));
            if (bulkOps.length > 0) {
                await Item.bulkWrite(bulkOps, { session });
            }
        });
        return deletedOrder;
    } catch (error: unknown) {
        if ((error as CustomError).statusCode) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to delete order: ${errorMessage}`);
    } finally {
        session.endSession();
    }
};
