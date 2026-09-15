import { Router } from "express";
import { getAllOrders, createOrder, deleteOrder, getById, updateOrder } from "../controllers/order.controller.js";
import { validateOrderItems } from "../middleware/validateOrderItems.js";
import { validateRequest } from "../middleware/validate.js";
import { createOrderSchema, updateOrderSchema, orderIdSchema } from "../validations/order.validation.js";

const router = Router();

router.post("/", validateRequest(createOrderSchema), validateOrderItems, createOrder);

router.get("/", getAllOrders);

router.get("/:id", validateRequest(orderIdSchema), getById);

router.put("/:id", validateRequest(updateOrderSchema), validateOrderItems, updateOrder);

router.delete("/:id", validateRequest(orderIdSchema), deleteOrder);

export default router;
