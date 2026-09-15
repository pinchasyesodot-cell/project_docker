import { z } from "zod";
import { paramsIdSchema, objectIdSchema } from "./common.validation.js";

const itemValidationSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters long"),
    consumerPrice: z.number().positive("Consumer price must be a positive number"),
    stock: z.number().int().min(0, "Stock cannot be negative"),
    category: z.string().trim().min(1, "Category is required"),
    supplierId: objectIdSchema,
});

export const createItemSchema = z.object({
    body: itemValidationSchema,
});

export const updateItemSchema = z.object({
    params: paramsIdSchema,
    body: itemValidationSchema
        .partial()
        .refine((body) => Object.keys(body).length > 0, { message: "At least one field must be provided for update" }),
});

export const itemIdSchema = z.object({
    params: paramsIdSchema,
});

export type ItemBase = z.infer<typeof itemValidationSchema>;
