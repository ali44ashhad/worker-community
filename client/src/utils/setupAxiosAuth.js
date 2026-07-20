import axios from "axios";
import { toast } from "react-hot-toast";
import { isAuthApiError } from "./apiToast";
import { clearAuthSession } from "../features/authSlice.js";

axios.defaults.withCredentials = true;

let handlingSessionExpiry = false;

/**
 * Global 401 handler: clear client session once, single toast, redirect to login.
 */
export function setupAxiosAuth(store) {
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            const status = error.response?.status;
            const data = error.response?.data;
            const message = data?.message;
            const requestUrl = String(error.config?.url || "");

            const isLoginAttempt =
                /\/api\/user\/login/i.test(requestUrl) ||
                /\/api\/user\/register/i.test(requestUrl) ||
                /\/api\/user\/login\/verify-otp/i.test(requestUrl);

            if (isAuthApiError(status, data, message) && !isLoginAttempt) {
                const isInitialCheck = requestUrl.includes("/api/user/check-auth");

                if (!handlingSessionExpiry) {
                    handlingSessionExpiry = true;
                    store.dispatch(clearAuthSession());

                    if (!isInitialCheck) {
                        toast.error("Your session expired. Please log in again.");
                        const path = window.location?.pathname || "";
                        if (!path.startsWith("/login")) {
                            window.location.assign("/login");
                        }
                    }

                    window.setTimeout(() => {
                        handlingSessionExpiry = false;
                    }, 3000);
                }
            }

            return Promise.reject(error);
        }
    );
}
