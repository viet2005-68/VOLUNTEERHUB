import axios from "axios";
// Import store để dùng hàm logout khi token hết hạn
import { useAuth } from "../hook/useAuth";

/** Gateway base should end with `/api` once. Collapse accidental `/api/api`. */
function resolveApiBase() {
    const raw = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(/\/+$/, "");
    return raw.replace(/\/api\/api$/i, "/api");
}

const axiosClient = axios.create({
    baseURL: resolveApiBase(),
    headers: {
        "Content-Type": "application/json",
    },
});

//REQUEST INTERCEPTOR
axiosClient.interceptors.request.use(
    (config) => {
        // Lấy token từ localStorage (giống cách bạn làm trong getInitialUser)
        const token = localStorage.getItem("token");
        console.log(token);
        if (token) {
            // Gắn token vào header Authorization theo chuẩn Bearer
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Don't set Content-Type for FormData, let browser set it with boundary
        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
            delete config.headers.common?.["Content-Type"];
            const method = config.method?.toLowerCase();
            if (method && config.headers[method]) {
                delete config.headers[method]["Content-Type"];
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

//RESPONSE INTERCEPTOR (Nhận về)
axiosClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;

        // Kiểm tra nếu lỗi là 401 (Unauthorized) và chưa từng retry request này
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            console.warn("Token hết hạn hoặc không hợp lệ. Đang logout...");

            // GỌI HÀM LOGOUT TỪ ZUSTAND STORE
            await useAuth.logout();

            //Điều hướng về trang landing
            window.location.href = "/";
        }

        return Promise.reject(error);
    }
);

export default axiosClient;