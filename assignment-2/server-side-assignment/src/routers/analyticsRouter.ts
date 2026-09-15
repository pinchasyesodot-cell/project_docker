import { Router } from "express";
import {
    getDailyTopItem,
    getItemMargins,
    getMonthlyRevenue,
    getMostProfitableSupplier,
    getWeeklyTopCategory,
} from "../controllers/Analytics.controller.js";

const router = Router();

router.get("/monthly-revenue", getMonthlyRevenue);

router.get("/top-category", getWeeklyTopCategory);

router.get("/daily-top-item", getDailyTopItem);

router.get("/item-margins", getItemMargins);

router.get("/top-supplier", getMostProfitableSupplier);

export default router;
