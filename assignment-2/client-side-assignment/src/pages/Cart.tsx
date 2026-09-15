import React, { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, CreditCard } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { removeFromCart, updateQuantity, clearCart, addToCart } from "../redux/cartSlice";
import { getItems } from "../api/items";
import { createOrder } from "../api/orders";
import styles from "./Cart.module.css";
import { toast } from "react-toastify";
import type { CartItem, Item, Order } from "../types";
import axios from "axios";

const Cart: React.FC = () => {
    const { cartItems, totalPrice } = useAppSelector((state) => state.cart);
    const dispatch = useAppDispatch();
    const queryClient = useQueryClient();
    const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
    const { mutate: handleCheckout, isPending } = useMutation({
        mutationFn: async () => {
            if (cartItems.length === 0) throw new Error("העגלה ריקה");
            const orderPayload: Order = {
                address: "איסוף עצמי",
                items: cartItems.map((item) => ({
                    itemId: item._id,
                    quantity: item.quantity,
                    price: item.consumerPrice || 0,
                })),
            };
            return createOrder(orderPayload);
        },
        onSuccess: () => {
            toast.success("ההזמנה בוצעה בהצלחה! הסטטיסטיקות מתעדכנות...");
            queryClient.invalidateQueries({ queryKey: ["revenue"] });
            queryClient.invalidateQueries({ queryKey: ["topItem"] });
            queryClient.invalidateQueries({ queryKey: ["items"] });
            dispatch(clearCart());
        },
        onError: (err: unknown) => {
            if (axios.isAxiosError(err)) {
                console.error(err);
                const errorMsg = err.response?.data?.message || "חלה שגיאה בביצוע ההזמנה";
                toast.error(errorMsg);
            } else {
                toast.error("חלה שגיאה בלתי צפויה");
            }
        },
    });
    const handleAddToCart = (item: Item) => {
        const cartItem = cartItems.find((i) => i._id === item._id);
        const currentQuantity = cartItem ? cartItem.quantity : 0;
        if (currentQuantity + 1 > item.stock) {
            toast.error(`מצטערים, אין מספיק מלאי. נותרו רק ${item.stock} יחידות`, {
                toastId: `stock-limit-${item._id}`,
                position: "top-left",
            });
            return;
        }
        if (currentQuantity + 1 > 50) {
            toast.error("לא ניתן להוסיף יותר מ-50 יחידות ממוצר זה", {
                toastId: "max-items-error",
                position: "top-left",
                autoClose: 5000,
            });
            return;
        }
        if (!cartItem && cartItems.length >= 10) {
            toast.error("לא ניתן להוסיף יותר מ-10 סוגי מוצרים שונים", {
                toastId: "unique-items-limit",
                position: "top-left",
            });
            return;
        }

        dispatch(addToCart({ item, quantity: 1 }));
        toast.success("המוצר נוסף לעגלה!");
    };

    const handlePlusClick = (item: CartItem) => {
        if (item.quantity >= 50) {
            toast.error("לא ניתן להוסיף יותר מ-50 יחידות ממוצר זה", {
                toastId: "max-items-error",
                position: "bottom-right",
                autoClose: 5000,
            });
            return;
        }
        if (item.quantity >= item.stock) {
            toast.error(`מצטערים, אין מספיק מלאי. נותרו רק ${item.stock} יחידות`, {
                toastId: `stock-limit-${item._id}`,
                position: "bottom-right",
            });
            return;
        }
        dispatch(updateQuantity({ id: item._id, quantity: item.quantity + 1 }));
    };

    const { data: allItems = [] } = useQuery({
        queryKey: ["items"],
        queryFn: getItems,
    });

    const recommendations = useMemo(() => {
        if (cartItems.length === 0 || allItems.length === 0) return [];
        const cartCategorySet = new Set(cartItems.map((i) => i.category));
        const cartIds = new Set(cartItems.map((i) => i._id));
        const candidates = allItems.filter(
            (item) => cartCategorySet.has(item.category) && !cartIds.has(item._id) && item.stock > 0
        );
        if (candidates.length < 4) {
            const otherCandidates = allItems.filter((item) => !cartIds.has(item._id) && item.stock > 0);
            candidates.push(...otherCandidates);
        }
        return candidates.sort(() => 0.5 - Math.random()).slice(0, 4);
    }, [cartItems, allItems]);

    if (cartItems.length === 0) {
        return (
            <div className={`container ${styles.emptyContainer}`}>
                <div className={`glass ${styles.emptyCart}`}>
                    <ShoppingBag size={64} className={styles.emptyIcon} />
                    <h2>העגלה שלך ריקה</h2>
                    <p>נראה שטרם הוספת מוצרים לעגלה.</p>
                    <Link to="/" className="btn btn-primary" style={{ marginTop: "2rem" }}>
                        <ArrowLeft size={20} />
                        חזרה לחנות
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`container ${styles.cartContainer}`}>
            <div className={styles.mainCart}>
                <div className={styles.cartHeader}>
                    <h1>עגלת קניות</h1>
                    <button className="btn btn-danger" onClick={() => dispatch(clearCart())}>
                        <Trash2 size={16} />
                        נקה עגלה
                    </button>
                </div>

                <div className={`glass ${styles.cartList}`}>
                    {cartItems.map((item) => (
                        <div key={item._id} className={styles.cartItem}>
                            <img src={item.image} alt={item.name} className={styles.itemImage} />

                            <div className={styles.itemDetails}>
                                <Link to={`/product/${item._id}`} className={styles.itemName}>
                                    {item.name}
                                </Link>
                                <div className={styles.itemCategory}>{item.category}</div>
                            </div>

                            <div className={styles.itemPrice}>₪{item.consumerPrice || 0}</div>

                            <div className={styles.quantityControl}>
                                <button
                                    className="btn btn-icon btn-secondary"
                                    onClick={() => {
                                        if (item.quantity > 1) {
                                            dispatch(updateQuantity({ id: item._id, quantity: item.quantity - 1 }));
                                        } else {
                                            dispatch(removeFromCart(item._id));
                                            toast.info("המוצר נמחק מהעגלה", {
                                                position: "bottom-right",
                                            });
                                        }
                                    }}
                                >
                                    <Minus size={14} />
                                </button>
                                <span className={styles.quantityDisplay}>{item.quantity}</span>
                                <button className="btn btn-icon btn-secondary" onClick={() => handlePlusClick(item)}>
                                    <Plus size={14} />
                                </button>
                            </div>

                            <div className={styles.itemTotal}>
                                ₪{((item.consumerPrice || 0) * item.quantity).toFixed(2)}
                            </div>

                            <button
                                className={`btn btn-icon ${styles.removeBtn}`}
                                onClick={() => dispatch(removeFromCart(item._id))}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>

                {recommendations.length > 0 && (
                    <div className={styles.recommendationsSection}>
                        <h3>אולי תאהב גם...</h3>
                        <div className={styles.recommendationsGrid}>
                            {recommendations.map((item) => (
                                <div key={item._id} className={`glass ${styles.recCard}`}>
                                    <img
                                        src={item.image || "https://via.placeholder.com/150"}
                                        alt={item.name}
                                        className={styles.recImage}
                                    />
                                    <div className={styles.recContent}>
                                        <h4 className={styles.recTitle}>{item.name}</h4>
                                        <span className={styles.recPrice}>
                                            ₪{item.consumerPrice || 0}
                                        </span>
                                        <button
                                            className="btn btn-primary"
                                            style={{ width: "100%", marginTop: "0.5rem", padding: "0.5rem" }}
                                            onClick={() => handleAddToCart(item)}
                                        >
                                            הוסף לעגלה
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className={`glass ${styles.summarySidebar}`}>
                <h2>סיכום הזמנה</h2>

                <div className={styles.summaryRow}>
                    <span>פריטים ({totalQuantity}):</span>
                    <span>₪{totalPrice.toFixed(2)}</span>
                </div>

                <div className={styles.summaryRow}>
                    <span>דמי משלוח:</span>
                    <span>חינם</span>
                </div>

                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                    <span>סך הכל:</span>
                    <span className={styles.totalPrice}>₪{totalPrice.toFixed(2)}</span>
                </div>

                {/* עדכון הכפתור לחיבור המוטציה */}
                <button
                    className={`btn btn-primary ${styles.checkoutBtn}`}
                    onClick={() => handleCheckout()}
                    disabled={isPending || cartItems.length === 0}
                >
                    {isPending ? (
                        <>מעבד הזמנה...</>
                    ) : (
                        <>
                            <CreditCard size={18} style={{ marginLeft: "8px" }} />
                            מעבר לתשלום
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Cart;
