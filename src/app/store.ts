import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../reducer/user/userSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

// 👇 Tipos inferidos automáticamente
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
