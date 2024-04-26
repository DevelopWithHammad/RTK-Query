import { configureStore } from "@reduxjs/toolkit";
import { apiService } from "../services/apiService";

export const store = configureStore({
    reducer: {
        [apiService.reducerPath]: apiService.reducer,
    },
    middleware: (getDefaultMiddleware) => [
        ...getDefaultMiddleware(),
        apiService.middleware,
    ]
})