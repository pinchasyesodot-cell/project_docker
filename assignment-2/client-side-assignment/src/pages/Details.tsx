import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ShoppingCart, Minus, Plus } from "lucide-react";
import { toast } from "react-toastify";
import { getItemById } from "../api/items";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { addToCart } from "../redux/cartSlice";
import styles from "./Details.module.css";

const Details: React.FC = () => {
    const { cartItems } = useAppSelector((state) => state.cart);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [quantity, setQuantity] = useState(1);

    const {
        data: item,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["item", id],
        queryFn: () => getItemById(id as string),
        enabled: !!id,
    });

    if (isLoading)
        return (
            <div className="loader-container">
                <div className="spinner"></div>
            </div>
        );

    if (isError || !item) {
        return (
            <div className="container">
                <div className="glass" style={{ padding: "2rem", textAlign: "center" }}>
                    <h2>שגיאה: המוצר לא נמצא</h2>
                    <button className="btn btn-secondary" onClick={() => navigate("/")} style={{ marginTop: "1rem" }}>
                        חזרה לדף הבית
                    </button>
                </div>
            </div>
        );
    }

    const handleAddToCart = () => {
        const existingInCart = cartItems.find((i) => i._id === item._id);
        const currentQuantity = existingInCart ? existingInCart.quantity : 0;

        if (currentQuantity + quantity > item.stock) {
            toast.error(`ישנם רק ${item.stock} פריטים במלאי`, {
                toastId: `stock-limit-${item._id}`,
                position: "bottom-right",
            });
            return;
        }
        if (currentQuantity + quantity > 50) {
            toast.error("לא ניתן להוסיף יותר מ-50 יחידות ממוצר זה", {
                toastId: "max-items-error",
                position: "bottom-right",
                autoClose: 5000,
            });
            return;
        }
        if (!existingInCart && cartItems.length >= 10) {
            toast.error("לא ניתן להוסיף יותר מ-10 סוגי מוצרים שונים", {
                toastId: "unique-items-limit",
                position: "bottom-right",
            });
            return;
        }
        dispatch(addToCart({ item, quantity }));
        toast.success("המוצר נוסף לעגלה!");
    };

    const handleIncrease = () => {
        if (quantity < item.stock) setQuantity((prev) => prev + 1);
    };

    const handleDecrease = () => {
        if (quantity > 1) setQuantity((prev) => prev - 1);
    };

    return (
        <div className={`container ${styles.detailsContainer}`}>
            <button className={`btn btn-secondary ${styles.backButton}`} onClick={() => navigate(-1)}>
                <ArrowRight size={20} />
                חזרה
            </button>

            <div className={`glass ${styles.productCard}`}>
                <div className={styles.imageSection}>
                    <img
                        src={item.image || "https://via.placeholder.com/600"}
                        alt={item.name}
                        className={styles.image}
                    />
                </div>

                <div className={styles.infoSection}>
                    <div className={styles.badge}>{item.category}</div>
                    <h1 className={styles.title}>{item.name}</h1>

                    <div className={styles.priceRow}>
                        <span className={styles.price}>₪{item.consumerPrice || 0}</span>
                        <span className={styles.stock}>
                            {item.stock > 0 ? (
                                `במלאי: ${item.stock}`
                            ) : (
                                <span className={styles.outOfStock}>אזל מהמלאי</span>
                            )}
                        </span>
                    </div>

                    <p className={styles.description}>{item.description}</p>

                    <div className={styles.supplierInfo}>
                        <strong>ספק: </strong>
                        {item.supplier?.name || "לא ידוע"}
                        {(() => {})()}
                    </div>

                    <div className={styles.actions}>
                        <div className={styles.quantityControl}>
                            <button
                                className="btn btn-icon btn-secondary"
                                onClick={handleDecrease}
                                disabled={quantity <= 1 || item.stock === 0}
                            >
                                <Minus size={16} />
                            </button>
                            <span className={styles.quantityDisplay}>{quantity}</span>
                            <button
                                className="btn btn-icon btn-secondary"
                                onClick={handleIncrease}
                                disabled={quantity >= item.stock || item.stock === 0}
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        <button
                            className={`btn btn-primary ${styles.addToCartBtn}`}
                            onClick={handleAddToCart}
                            disabled={item.stock === 0}
                        >
                            <ShoppingCart size={20} />
                            הוסף לעגלה
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Details;
