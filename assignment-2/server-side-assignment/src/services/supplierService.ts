import { ClientSession, startSession } from "mongoose";
import { ISupplier, ISupplierItem } from "../interfaces/Supplier.js";
import { Supplier } from "../models/Supplier.js";
import { Item } from "../models/Item.js";
import { CustomError } from "../interfaces/Error.js";
import { ISItem } from "../interfaces/Item.js";

export const createNewSupplier = async (supplierData: Omit<ISupplier, "items">): Promise<ISupplier> => {
    try {
        const newSupplier = new Supplier(supplierData);
        return await newSupplier.save();
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to create new supplier: ${errorMessage}`);
    }
};

export const getAllSuppliersInDB = async (): Promise<ISupplier[]> => {
    try {
        return await Supplier.find().select("-__v").lean() as unknown as ISupplier[];
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to get all supplier: ${errorMessage}`);
    }
};

export const getSupplierById = async (id: string): Promise<ISupplier | null> => {
    try {
        const supplier = (await Supplier.findById(id).select("-__v").lean()) as ISupplier | null;
        if (!supplier) return null;
        const items = await Item.find({ supplierId: id }).select("-__v").lean() as unknown as ISItem[];
        const foratedItems: ISupplierItem[] = items.map((item) => ({
            _id: item._id,
            itemId: item._id.toString(),
            itemName: item.name,
            price: item.consumerPrice,
        }));
        return { ...supplier, items: foratedItems };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to get supplier by ID: ${errorMessage}`);
    }
};

export const getSupplierByName = async (name: string): Promise<ISupplier | null> => {
    try {
        return (await Supplier.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } })
            .select("-__v")
            .lean()) as ISupplier | null;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to get supplier by name: ${errorMessage}`);
    }
};

export const updateSupplierInDB = async (
    id: string,
    updateData: Partial<Omit<ISupplier, "items">>,
    session?: ClientSession
): Promise<ISupplier | null> => {
    try {
        const updatedSupplier = await Supplier.findByIdAndUpdate(
            id,
            {
                $set: updateData,
            },
            { new: true, runValidators: true, session }
        )
            .select("-__v")
            .lean();
        if (!updatedSupplier) {
            const error = new Error("Supplier not found") as CustomError;
            error.statusCode = 404;
            throw error;
        }
        return updatedSupplier;
    } catch (error: unknown) {
        if ((error as CustomError).statusCode) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to update supplier: ${errorMessage}`);
    }
};

export const addItemsToSupplier = async (
    supplierId: string,
    items: ISupplierItem[],
    session?: ClientSession
): Promise<ISupplier> => {
    try {
        const addItems = (await Supplier.findByIdAndUpdate(
            supplierId,
            {
                $push: {
                    items: {
                        $each: items,
                    },
                },
            },
            { new: true, runValidators: true, session }
        )
            .select("-__v")
            .lean()) as ISupplier | null;
        if (!addItems) {
            const error = new Error("Supplier not found") as CustomError;
            error.statusCode = 404;
            throw error;
        }
        return addItems;
    } catch (error: unknown) {
        if ((error as CustomError).statusCode) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to add items to supplier: ${errorMessage}`);
    }
};

export const handleSupplierUpdate = async (
    supplierId: string,
    updateData: Partial<ISupplier>
): Promise<ISupplier | null> => {
    const session = await startSession();
    session.startTransaction();
    try {
        const { items, ...supplierData } = updateData;
        const hasItems = items && items.length > 0;
        const hasDetails = Object.keys(supplierData).length > 0;
        if (!hasDetails && !hasItems) {
            throw new Error("No update data provided");
        }
        let result: ISupplier | null = null;
        if (hasItems) {
            result = await addItemsToSupplier(supplierId, items as ISupplierItem[], session);
        }
        if (hasDetails) {
            result = await updateSupplierInDB(supplierId, supplierData as Omit<ISupplier, "items">, session);
        }
        await session.commitTransaction();
        return result;
    } catch (error: unknown) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

export const deleteSupplierById = async (id: string): Promise<ISupplier> => {
    const session = await startSession();
    session.startTransaction();
    try {
        await Item.deleteMany({ supplierId: id }, { session });
        const deletedSupplier = await Supplier.findByIdAndDelete(id, { session }).select("-__v").lean();
        if (!deletedSupplier) throw new Error("Supplier not found");
        await session.commitTransaction();
        return deletedSupplier;
    } catch (error: unknown) {
        await session.abortTransaction();
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to delete supplier: ${errorMessage}`);
    } finally {
        session.endSession();
    }
};
