import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Item, CartItem } from "../types";

interface CartState {
    cartItems: CartItem[];
    totalPrice: number;
}

const loadCartFromStorage = (): CartState => {
    try {
        const saveCart = localStorage.getItem("shopping_cart");
        if (saveCart) {
            return JSON.parse(saveCart);
        }
    } catch (error) {
        console.error("Could not load cart", error);
    }
    return {
        cartItems: [],
        totalPrice: 0,
    };
};

const saveCartToStorage = (state: CartState) => {
    try {
        localStorage.setItem("shopping_cart", JSON.stringify(state));
    } catch (error) {
        console.error("Could not save cart", error);
    }
};

const initialState:CartState = loadCartFromStorage();


const calculateTotal = (items: CartItem[]) => {
    return items.reduce((total, item) => total + (item.consumerPrice || 0) * item.quantity, 0);
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<{ item: Item; quantity: number }>) => {
            const { item, quantity } = action.payload;
            const existingItem = state.cartItems.find((i) => i._id === item._id);
            const currentQty = existingItem ? existingItem.quantity : 0;
            const newQuantity = currentQty + quantity;
            if (newQuantity > 50) return;
            if (newQuantity > item.stock) return;
            if (!existingItem && state.cartItems.length >= 10) {
                return;
            }
            if (existingItem) {
                existingItem.quantity = newQuantity;
            } else {
                state.cartItems.push({ ...item, quantity });
            }
            state.totalPrice = calculateTotal(state.cartItems);
            saveCartToStorage(state);
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.cartItems = state.cartItems.filter((item) => item._id !== action.payload);
            state.totalPrice = calculateTotal(state.cartItems);
            saveCartToStorage(state);
        },
        updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
            const { id, quantity } = action.payload;
            const existingItem = state.cartItems.find((item) => item._id === id);
            if (existingItem) {
                if (quantity > existingItem.stock) return;
                if (quantity <= 0) {
                    state.cartItems = state.cartItems.filter((item) => item._id !== id);
                } else {
                    existingItem.quantity = quantity;
                }
            }
            state.totalPrice = calculateTotal(state.cartItems);
            saveCartToStorage(state);
        },
        clearCart: (state) => {
            state.cartItems = [];
            state.totalPrice = 0;
            saveCartToStorage(state);
        },
    },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
