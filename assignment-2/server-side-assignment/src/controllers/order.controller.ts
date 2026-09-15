import { NextFunction, Request, Response } from "express";
import { OrderBase } from "../validations/order.validation.js";
import {
    deleteOrderById,
    getAllOrdersInDB,
    getOrderById,
    processNewOrder,
    updateOrderInDB,
} from "../services/orderService.js";
import logger from "../utils/Logger.js";

export const createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const orderData: OrderBase = req.body;
        const createdOrder = await processNewOrder(orderData);
        res.status(201).json(createdOrder);
    } catch (error) {
        logger.error("Failed to create order", { error: (error as Error).message });
        next(error);
    }
};

export const getAllOrders = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const orders = await getAllOrdersInDB();
        res.json(orders);
    } catch (error) {
        logger.error("Failed to get all orders", { error: (error as Error).message });
        next(error);
    }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const orderId = req.params.id as string;
        const orders = await getOrderById(orderId);
        if (orders === null) {
            res.status(404).json({ error: "Order not found" });
            return;
        }
        res.json(orders);
    } catch (error) {
        logger.error(`Failed to get order with ID ${req.params.id}`, { error: (error as Error).message });
        next(error);
    }
};

export const updateOrder = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const orderData: OrderBase = req.body;
        const updatedOrder = await updateOrderInDB(id, orderData);
        if (updatedOrder === null) {
            res.status(404).json({ error: "Order not found" });
            return;
        }
        res.json(updatedOrder);
    } catch (error) {
        logger.error(`Failed to update order with ID ${req.params.id}`, { error: (error as Error).message });
        next(error);
    }
};

export const deleteOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const orderId = req.params.id as string;
        const deletedOrder = await deleteOrderById(orderId);
        if (deletedOrder === null) {
            res.status(404).json({ error: "Order not found" });
            return;
        }
        res.json(deletedOrder);
    } catch (error) {
        logger.error(`Failed to delete order with ID ${req.params.id}`, { error: (error as Error).message });
        next(error);
    }
};
