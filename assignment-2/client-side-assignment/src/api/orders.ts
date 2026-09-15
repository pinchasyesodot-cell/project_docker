import { api } from "./axios";
import type { Order } from "../types";

const BASE_URL = "/orders";

export const getOrders = async (): Promise<Order[]> => {
  const { data } = await api.get(BASE_URL);
  return data;
};

export const getOrderById = async (id: string): Promise<Order> => {
  const { data } = await api.get(`${BASE_URL}/${id}`);
  return data;
};

export const createOrder = async (order: Partial<Order>): Promise<Order> => {
  const  {data}  = await api.post(BASE_URL, order);
  return data;
};

export const updateOrder = async (id: string, order: Partial<Order>): Promise<Order> => {
  const { data } = await api.put(`${BASE_URL}/${id}`, order);
  return data;
};

export const deleteOrder = async (id: string): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};
