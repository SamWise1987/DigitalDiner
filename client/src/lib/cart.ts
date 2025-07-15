// Cart management with localStorage persistence
export interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  sessionId: string | null;
  tableId: number | null;
}

const CART_STORAGE_KEY = 'restaurant_cart';

export const cartStorage = {
  getCart(): Cart {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Error reading cart from localStorage:', error);
    }
    
    return {
      items: [],
      sessionId: null,
      tableId: null
    };
  },

  saveCart(cart: Cart): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.warn('Error saving cart to localStorage:', error);
    }
  },

  clearCart(): void {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.warn('Error clearing cart from localStorage:', error);
    }
  },

  addItem(item: Omit<CartItem, 'quantity'>, quantity: number = 1): void {
    const cart = this.getCart();
    const existingItemIndex = cart.items.findIndex(
      cartItem => cartItem.menuItemId === item.menuItemId
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ ...item, quantity });
    }

    this.saveCart(cart);
  },

  updateQuantity(menuItemId: number, quantity: number): void {
    const cart = this.getCart();
    const itemIndex = cart.items.findIndex(
      item => item.menuItemId === menuItemId
    );

    if (itemIndex >= 0) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      this.saveCart(cart);
    }
  },

  removeItem(menuItemId: number): void {
    const cart = this.getCart();
    cart.items = cart.items.filter(item => item.menuItemId !== menuItemId);
    this.saveCart(cart);
  },

  setSession(sessionId: string, tableId: number): void {
    const cart = this.getCart();
    cart.sessionId = sessionId;
    cart.tableId = tableId;
    this.saveCart(cart);
  },

  getTotalPrice(): number {
    const cart = this.getCart();
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  getItemCount(): number {
    const cart = this.getCart();
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }
};