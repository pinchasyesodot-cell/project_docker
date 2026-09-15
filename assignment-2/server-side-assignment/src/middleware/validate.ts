import logger from "../utils/Logger.js";
import { Request, Response, NextFunction } from "express";
import { ZodError, z } from "zod";

export const validateRequest =
    (schema: z.ZodSchema) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            schema.parseAsync({ body: req.body, params: req.params });
            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                logger.warn(`Validation failed: ${JSON.stringify(error.issues)}`);
                res.status(400).json({
                    error: "Validation failed",
                    details: error.issues.map((err) => ({
                        field: err.path.join("."),
                        message: err.message,
                    })),
                });
                return;
            } else {
                next(error);
            }
        }
    };
