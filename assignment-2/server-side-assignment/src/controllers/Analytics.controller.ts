import { NextFunction, Request, Response } from "express";
import * as AnalyticsService from "../services/AnalyticsService.js";
import logger from "../utils/Logger.js";

export const getMonthlyRevenue = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const revenue = await AnalyticsService.getMonthlyRevenue();
        res.status(200).json({ success: true, data: revenue });
    } catch (error) {
        logger.error("Failed to fetch monthly revenue", { error: (error as Error).message });
        next(error);
    }
};

export const getWeeklyTopCategory = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const category = await AnalyticsService.getWeeklyTopCategory();
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        logger.error("Failed to fetch weekly top category", { error: (error as Error).message });
        next(error);
    }
};

export const getDailyTopItem = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const item = await AnalyticsService.getDailyTopItem();
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        logger.error("Failed to fetch daily top item", { error: (error as Error).message });
        next(error);
    }
};

export const getItemMargins = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const margins = await AnalyticsService.getItemMargins();
        res.status(200).json({ success: true, data: margins });
    } catch (error) {
        logger.error("Failed to fetch item margins", { error: (error as Error).message });
        next(error);
    }
};

export const getMostProfitableSupplier = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const supplier = await AnalyticsService.getMostProfitableSupplier();
        res.status(200).json({ success: true, data: supplier });
    } catch (error) {
        logger.error("Failed to fetch most profitable supplier", { error: (error as Error).message });
        next(error);
    }
};
