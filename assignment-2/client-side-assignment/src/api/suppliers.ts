import { api } from "./axios";
import type { Supplier } from "../types";

const BASE_URL = "/suppliers";

export const getSuppliers = async (): Promise<Supplier[]> => {
    const { data } = await api.get(BASE_URL);
    return data;
};

export const getSupplierById = async (id: string): Promise<Supplier> => {
    const { data } = await api.get(`${BASE_URL}/${id}`);
    return data;
};

export const createSupplier = async (supplier: Partial<Supplier>): Promise<Supplier> => {
    const { data } = await api.post(BASE_URL, supplier);
    return data;
};

export const updateSupplier = async (id: string, supplier: Partial<Supplier>): Promise<Supplier> => {
    const { data } = await api.put(`${BASE_URL}/${id}`, supplier);
    return data;
};

export const deleteSupplier = async (id: string): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
};
