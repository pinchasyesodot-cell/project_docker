import { NextFunction, Request, Response } from "express";
import {
    createNewSupplier,
    deleteSupplierById,
    getAllSuppliersInDB,
    handleSupplierUpdate,
} from "../services/supplierService.js";
import logger from "../utils/Logger.js";

export const createSupplier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const supplierData = req.body;
        const newSupplier = await createNewSupplier(supplierData);
        res.status(201).json(newSupplier);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        logger.error("Failed to create supplier", { error: errorMessage });
        next(error);
    }
};

export const getAllSuppliers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const suppliers = await getAllSuppliersInDB();
        res.status(200).json(suppliers);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        logger.error("Failed to fetch suppliers", { error: errorMessage });
        next(error);
    }
};

export const getSupplierById = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const supplier = res.locals.supplier;
        res.status(200).json(supplier);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        logger.error("Failed to fetch supplier", { error: errorMessage });
        next(error);
    }
};

export const updateSupplier = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const updatedSupplier = await handleSupplierUpdate(id, req.body);
        if (!updatedSupplier) {
            res.status(404).json({ message: "Supplier not found" });
            return;
        }
        res.status(200).json(updatedSupplier);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        logger.error("Failed to update supplier", { error: errorMessage, body: req.body });
        next(error);
    }
};

export const deleteSupplier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const deletedSupplier = await deleteSupplierById(id);
        res.status(200).json({ deletedSupplier, message: "Supplier deleted successfully" });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        logger.error("Failed to delete supplier", { error: errorMessage });
        next(error);
    }
};
