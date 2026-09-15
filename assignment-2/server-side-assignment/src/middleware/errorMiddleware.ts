import { Request, Response, NextFunction } from "express";
import { CustomError } from "../interfaces/Error.js";

export const errorHandler = (err: CustomError, _req: Request, res: Response, _next: NextFunction): void => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ error: err.message || "Internal Server Error", stack: err.stack });
};
