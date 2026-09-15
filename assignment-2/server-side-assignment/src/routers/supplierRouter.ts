import { Router } from "express";
import {
    createSupplier,
    deleteSupplier,
    getSupplierById,
    getAllSuppliers,
    updateSupplier,
} from "../controllers/supplier.controller.js";
import { isNameUnique, supplierExists } from "../middleware/supplierMiddleware.js";
import { validateRequest } from "../middleware/validate.js";
import { createSupplierSchema, supplierIdSchema, updateSupplierSchema } from "../validations/supplier.validation.js";

const router = Router();

router.post("/", validateRequest(createSupplierSchema), isNameUnique, createSupplier);

router.get("/", getAllSuppliers);

router.get("/:id", validateRequest(supplierIdSchema), supplierExists, getSupplierById);

router.put("/:id", validateRequest(updateSupplierSchema), supplierExists, isNameUnique, updateSupplier);

router.delete("/:id", validateRequest(supplierIdSchema), supplierExists, deleteSupplier);

export default router;
