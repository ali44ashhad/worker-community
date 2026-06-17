import {configureStore} from '@reduxjs/toolkit';
import authReducer from '../features/authSlice.js';
import providerReducer from '../features/providerSlice.js';
import commentReducer from '../features/commentSlice.js';
import wishlistReducer from '../features/wishlistSlice.js';
import adminReducer from '../features/adminSlice.js';
import secretaryReducer from '../features/secretarySlice.js';
import communityReducer from '../features/communitySlice.js';
import servicesReducer from '../features/serviceSlice.js';

export const store = configureStore({
    reducer: {
        auth:authReducer,
        provider: providerReducer,
        services: servicesReducer,
        comments: commentReducer,
        wishlist: wishlistReducer,
        admin: adminReducer,
        secretary: secretaryReducer,
        community: communityReducer,
    },
});