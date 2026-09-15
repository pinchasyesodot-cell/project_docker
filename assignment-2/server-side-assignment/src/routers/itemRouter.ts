import { Router } from "express";
import { createItem, deleteItem, getItemById, getAllItems, updateItem } from "../controllers/item.controller.js";
import { checkItemExists } from "../middleware/itemMiddleware.js";
import { supplierExists } from "../middleware/supplierMiddleware.js";
import { validateRequest } from "../middleware/validate.js";
import { createItemSchema, itemIdSchema, updateItemSchema } from "../validations/item.validation.js";

const router = Router();

router.post("/", validateRequest(createItemSchema), supplierExists, createItem);

router.get("/", getAllItems);

router.get("/:id", validateRequest(itemIdSchema), checkItemExists, getItemById);

router.put("/:id", validateRequest(updateItemSchema), checkItemExists, updateItem);

router.delete("/:id", validateRequest(itemIdSchema), checkItemExists, deleteItem);

export default router;
