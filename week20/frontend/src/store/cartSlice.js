import { createSlice } from "@reduxjs/toolkit";

const loadCartFromStorage = () => {
  try {
    const serializedCart = localStorage.getItem("cart");
    return serializedCart ? JSON.parse(serializedCart) : [];
  } catch (e) {
    console.error("Failed to load cart from localStorage", e);
    return [];
  }
};

const saveCartToStorage = (items) => {
  try {
    localStorage.setItem("cart", JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save cart to localStorage", e);
  }
};

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: loadCartFromStorage(),
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.product.id === product.id);
      
      const newQuantity = existingItem 
        ? existingItem.quantity + quantity 
        : quantity;

      // Limit quantity to available stock
      const finalQuantity = Math.min(newQuantity, product.stock);

      if (existingItem) {
        existingItem.quantity = finalQuantity;
      } else {
        state.items.push({ product, quantity: finalQuantity });
      }
      
      saveCartToStorage(state.items);
    },
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item.product.id !== productId);
      saveCartToStorage(state.items);
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.product.id === productId);
      
      if (existingItem) {
        const finalQuantity = Math.max(1, Math.min(quantity, existingItem.product.stock));
        existingItem.quantity = finalQuantity;
        saveCartToStorage(state.items);
      }
    },
    clearCart: (state) => {
      state.items = [];
      saveCartToStorage([]);
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) =>
  state.cart.items.reduce((total, item) => total + parseFloat(item.product.price) * item.quantity, 0);
export const selectCartCount = (state) =>
  state.cart.items.reduce((count, item) => count + item.quantity, 0);

export default cartSlice.reducer;
