import { z } from "zod";
import mongoose from "mongoose";

export const objectIdSchema = z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Invalid ID format" });

export const paramsIdSchema = z.object({
    id: objectIdSchema,
});
