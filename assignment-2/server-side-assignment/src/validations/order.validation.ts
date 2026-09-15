import { z } from "zod";
import { paramsIdSchema, objectIdSchema } from "./common.validation.js";

const orderValidationSchema = z.object({
    address: z.string().trim().min(1, "Address is required"),
    items: z
        .array(
            z.object({
                itemId: objectIdSchema,
                quantity: z.number().int().min(1, "Quantity must be at least 1"),
            })
        )
        .min(1, "Order must have at least one item")
        .max(10, "Order cannot have more than 10 items"),
    shopProfit: z.number().positive().optional(),
});

export const createOrderSchema = z.object({
    body: orderValidationSchema,
});

export const updateOrderSchema = z.object({
    params: paramsIdSchema,
    body: orderValidationSchema.partial(),
});

export const orderIdSchema = z.object({
    params: paramsIdSchema,
});

export type OrderBase = z.infer<typeof orderValidationSchema>;
