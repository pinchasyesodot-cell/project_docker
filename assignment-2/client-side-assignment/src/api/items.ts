import { api } from "./axios";
import type { Item } from "../types";

const BASE_URL = "items";

export const getItems = async (): Promise<Item[]> => {
    const { data } = await api.get(BASE_URL);
    return data;
};

export const getItemById = async (id: string): Promise<Item> => {
    const { data } = await api.get(`${BASE_URL}/${id}`);
    return data;
};

export const createItem = async (item: Partial<Item>): Promise<Item> => {
    const { data } = await api.post(BASE_URL, item);
    return data;
};

export const updateItem = async (id: string, item: Partial<Item>): Promise<Item> => {
    const { data } = await api.put(`${BASE_URL}/${id}`, item);
    return data;
};

export const deleteItem = async (id: string): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
};
