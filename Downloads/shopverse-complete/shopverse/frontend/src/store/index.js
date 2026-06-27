import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { cartReducer, wishlistReducer } from './slices/cartWishlistSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
