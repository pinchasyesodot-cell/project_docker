import { Request, Response, NextFunction } from "express";
import { Supplier } from "../models/Supplier.js";
import { isValidObjectId } from "mongoose";
import { Item } from "../models/Item.js";

export const verifySupplierExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const supplierId = req.body.supplierId || req.params.supplierId || req.query.supplierId;

        if (!isValidObjectId(supplierId)) {
            return res.status(400).json({ error: "Invalid Supplier ID format" });
        }

        const supplier = await Supplier.findById(supplierId);
        if (!supplier) {
            return res.status(404).json({ error: "Supplier not found" });
        }
        return next();
    } catch (error) {
        next(error);
    }
};

export const checkItemExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const item = await Item.findById(id).select("-__v -createdAt -updatedAt").lean();
        const supplier = await Supplier.findById(item?.supplierId).select("-__v -createdAt -updatedAt").lean();
        if (!item) {
            return res.status(404).json({ error: "Item not found" });
        }
        if (!supplier) {
            return res.status(404).json({ error: "supplier not found" });
        }
        res.locals.item = item;
        res.locals.supplier = supplier
        return next();
    } catch (error) {
        next(error);
    }
};
