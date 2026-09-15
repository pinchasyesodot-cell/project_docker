import { NextFunction, Request, Response } from "express";
import { getSupplierByName } from "../services/supplierService.js";
import { Supplier } from "../models/Supplier.js";

export const isNameUnique = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name } = req.body;
        const { id } = req.params;
        if (!name) {
            if (!id) {
                res.status(400).json({ error: "Supplier name is required" });
                return;
            }
            return next();
        }
        const existingSupplier = await getSupplierByName(name);
        if (existingSupplier) {
            res.status(409).json({ error: "Supplier name must be unique" });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
};

export const supplierExists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const supplierId = req.params.id || req.body.supplierId;
        if (!supplierId) {
            res.status(400).json({ error: "Supplier ID is required" });
            return;
        }
        const supplier = await Supplier.findById(supplierId as string).populate("items").select("-__v").lean();
        if (!supplier) {
            res.status(404).json({ error: "Supplier not found" });
            return;
        }
        res.locals.supplier = supplier;
        next();
    } catch (error) {
        next(error);
    }
};
