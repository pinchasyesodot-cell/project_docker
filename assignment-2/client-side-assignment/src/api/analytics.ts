import { api } from "./axios";

const BASE_URL = "/analytics";

export const getMonthlyRevenue = async () => {
    const { data } = await api.get(`${BASE_URL}/monthly-revenue`);
    return data;
};

export const getWeeklyTopCategory = async () => {
    const { data } = await api.get(`${BASE_URL}/top-category`);
    return data;
};

export const getDailyTopItem = async () => {
    const { data } = await api.get(`${BASE_URL}/daily-top-item`);
    return data;
};

export const getItemMargins = async () => {
    const { data } = await api.get(`${BASE_URL}/item-margins`);
    return data;
};

export const getMostProfitableSupplier = async () => {
    const { data } = await api.get(`${BASE_URL}/top-supplier`);
    return data;
};
