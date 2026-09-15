import { Item } from "../models/Item.js";
import { OrderModel } from "../models/Order.js";
import { PipelineStage } from "mongoose";

interface RevenueResult {
    totalRevenue: number;
}

interface CategoryProfitResult {
    _id: string;
    totalProfit: number;
}

interface ItemProfitResult {
    _id: string;
    name: string;
    totalProfit: number;
}

interface ItemMarginResult {
    name: string;
    margin: number;
}

interface SupplierProfitResult {
    _id: string;
    totalProfit: number;
}

export const getMonthlyRevenue = async (): Promise<number> => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const result = await OrderModel.aggregate<RevenueResult>([
            {
                $match: {
                    orderDate: { $gte: thirtyDaysAgo },
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$shopProfit" },
                },
            },
        ]);
        return result.length > 0 ? result[0].totalRevenue : 0;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to calculate monthly revenue: ${errorMessage}`);
    }
};

export const getWeeklyTopCategory = async (): Promise<CategoryProfitResult | null> => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const result = await OrderModel.aggregate<CategoryProfitResult>([
            {
                $match: {
                    orderDate: { $gte: sevenDaysAgo },
                },
            },
            {
                $unwind: "$items",
            },
            {
                $lookup: {
                    from: "items",
                    localField: "items.itemId",
                    foreignField: "_id",
                    as: "itemDetails",
                },
            },
            { $unwind: "$itemDetails" },
            {
                $group: {
                    _id: "$itemDetails.category",
                    totalProfit: {
                        $sum: "$shopProfit",
                    },
                },
            },
            {
                $sort: { totalProfit: -1 },
            },
            {
                $limit: 1,
            },
        ]);
        return result.length > 0 ? result[0] : null;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to calculate weekly profitable category: ${errorMessage}`);
    }
};

export const getDailyTopItem = async (): Promise<ItemProfitResult | null> => {
    try {
        const twentyFoutHoursAgo = new Date();
        twentyFoutHoursAgo.setHours(twentyFoutHoursAgo.getHours() - 24);
        const result = await OrderModel.aggregate<ItemProfitResult>([
            {
                $match: {
                    orderDate: { $gte: twentyFoutHoursAgo },
                },
            },
            {
                $unwind: "$items",
            },
            {
                $lookup: {
                    from: "items",
                    localField: "items.itemId",
                    foreignField: "_id",
                    as: "itemDetails",
                },
            },
            { $unwind: "$itemDetails" },
            {
                $group: {
                    _id: "$itemDetails._id",
                    name: { $first: "$itemDetails.name" },
                    totalProfit: {
                        $sum: {
                            $multiply: [
                                "$items.quantity",
                                { $subtract: ["$itemDetails.price", "$itemDetails.supplierPrice"] },
                            ],
                        },
                    },
                },
            },
            { $sort: { totalProfit: -1 } },
            { $limit: 1 },
        ]);
        return result.length > 0 ? result[0] : null;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to calculate daily top item: ${errorMessage}`);
    }
};

export const getItemMargins = async (): Promise<{
    highest: ItemMarginResult | null;
    lowest: ItemMarginResult | null;
}> => {
    try {
        const pipeline: PipelineStage[] = [
            {
                $lookup: {
                    from: "suppliers",
                    localField: "supplierId",
                    foreignField: "_id",
                    as: "supplierDetails",
                },
            },
            {
                $unwind: "$supplierDetails",
            },
            {
                $project: {
                    name: 1,
                    margin: {
                        $subtract: [
                            "$consumerPrice",
                            {
                                $let: {
                                    vars: {
                                        matchedItem: {
                                            $filter: {
                                                input: "$supplierDetails.items",
                                                as: "item",
                                                cond: { $eq: ["$$item.itemName", "$name"] },
                                            },
                                        },
                                    },
                                    in: { $arrayElemAt: ["$$matchedItem.price", 0] },
                                },
                            },
                        ],
                    },
                },
            },
            {
                $sort: { margin: -1 },
            },
        ];
        const result = await Item.aggregate<ItemMarginResult>(pipeline);
        return {
            highest: result.length > 0 ? result[0] : null,
            lowest: result.length > 0 ? result[result.length - 1] : null,
        };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to calculate item margins: ${errorMessage}`);
    }
};

export const getMostProfitableSupplier = async (): Promise<SupplierProfitResult | null> => {
    try {
        const result = await OrderModel.aggregate<SupplierProfitResult>([
            {
                $unwind: "$items",
            },
            {
                $lookup: {
                    from: "items",
                    localField: "items.itemId",
                    foreignField: "_id",
                    as: "itemDetails",
                },
            },
            { $unwind: "$itemDetails" },
            {
                $lookup: {
                    from: "suppliers",
                    localField: "itemDetails.supplierId",
                    foreignField: "_id",
                    as: "supplierDetails",
                },
            },
            { $unwind: "$supplierDetails" },
            {
                $group: {
                    _id: "$supplierDetails.name",
                    totalProfit: {
                        $sum: {
                            $multiply: [
                                "$items.quantity",
                                {
                                    $subtract: [
                                        "$itemDetails.consumerPrice",
                                        {
                                            $let: {
                                                vars: {
                                                    matchedItem: {
                                                        $filter: {
                                                            input: "$supplierDetails.items",
                                                            as: "item",
                                                            cond: { $eq: ["$$item.itemName", "$itemDetails.name"] },
                                                        },
                                                    },
                                                },
                                                in: { $arrayElemAt: ["$$matchedItem.price", 0] },
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                },
            },
            { $sort: { totalProfit: -1 } },
            { $limit: 1 },
        ]);
        return result.length > 0 ? result[0] : null;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to calculate top supplier: ${errorMessage}`);
    }
};
