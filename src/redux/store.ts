import { configureStore } from "@reduxjs/toolkit";
import { Platform } from "react-native";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import { baseApi } from "./api/baseApi";
import authReducer from "./feature/authSlice";
import secureStorage from "./feature/secureStorage";
import taskReducer from "./slices/taskSlice";
import categoryReducer from "./slices/categorySlice";
const getStorage = () => {
  if (Platform.OS === "web") {
    return require("redux-persist/lib/storage").default;
  }
  return secureStorage;
};
const persistConfig = {
  key: "auth",
  storage: getStorage(),
  whitelist: ["token", "user"],
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    tasks: taskReducer,
    categories: categoryReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store);
