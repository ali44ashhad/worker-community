import {configureStore} from '@reduxjs/toolkit';
import authReducer from '../features/authSlice.js';
import providerReducer from '../features/providerSlice.js';

export const store = configureStore({
    reducer: {
        // Add your reducers here
        auth:authReducer,
        provider: providerReducer,
    },
});