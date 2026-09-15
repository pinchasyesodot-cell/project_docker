import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, LayoutDashboard, Search, Store } from 'lucide-react';
import { useAppSelector } from '../redux/hooks';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
  const { cartItems } = useAppSelector((state) => state.cart);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const cartItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className={`${styles.navbar} glass`}>
      <div className={`container ${styles.navContent}`}>
        <Link to="/" className={styles.logo}>
          <Store className={styles.logoIcon} size={28} />
          <span>סטורX</span>
        </Link>

        {isHomePage && (
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} size={20} />
            <input 
              type="text" 
              className={styles.searchInput} 
              placeholder="חיפוש מוצרים..." 
              onChange={(e) => {
                // We'll dispatch a global event or use context/redux for search
                // For simplicity, we can dispatch a custom event
                window.dispatchEvent(new CustomEvent('search-change', { detail: e.target.value }));
              }}
            />
          </div>
        )}

        <div className={styles.navLinks}>
          <Link to="/admin" className={styles.navLink}>
            <LayoutDashboard size={20} />
            <span className="hidden-mobile">ניהול</span>
          </Link>
          <Link to="/cart" className={styles.navLink}>
            <ShoppingCart size={20} />
            <span className="hidden-mobile">עגלה</span>
            {cartItemsCount > 0 && (
              <span className={styles.cartBadge}
              data-testid = "cart-badge"
              >{cartItemsCount}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
