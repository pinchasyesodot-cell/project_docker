import { Request, Response, NextFunction } from "express";
import {
    createNewItem,
    deleteItemById,
    getAllItemsInDB,
    getItemByIdInDB,
    updateItemInDB,
    verifyProfitMargin,
} from "../services/itemService.js";
import logger from "../utils/Logger.js";
import { ItemBase } from "../validations/item.validation.js";
import { ISupplier } from "../interfaces/Supplier.js";
import { ISItem } from "../interfaces/Item.js";

export const createItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const itemData: ItemBase = req.body;
        const supplier = res.locals.supplier as ISupplier;
        verifyProfitMargin({ name: itemData.name, supplier }, itemData.consumerPrice!);
        const newItem = await createNewItem(itemData);
        logger.info("Item created successfully", { itemId: newItem._id });
        res.status(201).json(newItem);
    } catch (error) {
        logger.error("Failed to create item", { error: (error as Error).message, body: req.body });
        next(error);
    }
};

export const getAllItems = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const items = await getAllItemsInDB();
        res.status(200).json(items);
    } catch (error) {
        logger.error("Failed to fetch items", { error: (error as Error).message });
        next(error);
    }
};

export const getItemById = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const item: ISItem = res.locals.item;
        const itemAndSupplier = await getItemByIdInDB(item._id.toString());
        res.status(200).json(itemAndSupplier);
    } catch (error) {
        logger.error("Failed to fetch item", { error: (error as Error).message });
        next(error);
    }
};

export const updateItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = res.locals.item._id
        const itemData: Partial<ItemBase> = req.body;
        const currentItem = res.locals.item as ISItem;
        const supplier = res.locals.supplier as ISupplier
        if (itemData.consumerPrice !== undefined) {
            verifyProfitMargin({ name: currentItem.name, supplier }, itemData.consumerPrice);
        }
        const updatedItem = await updateItemInDB(id, itemData);
        res.status(200).json(updatedItem);
    } catch (error) {
        logger.error("Failed to update item", { error: (error as Error).message, body: req.body });
        next(error);
    }
};

export const deleteItem = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const item: ISItem = res.locals.item;
        const deletedItem = await deleteItemById(item._id as unknown as string);
        res.status(200).json(deletedItem);
    } catch (error) {
        logger.error("Failed to delete item", { error: (error as Error).message });
        next(error);
    }
};
