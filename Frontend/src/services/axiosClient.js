import axios from "axios";
import { useAuthStore } from "../store/authStore";

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

let refreshTokenPromise = null;

function resolveAuthBase() {
    return (import.meta.env.VITE_API_LOGIN || "http://localhost:7070").replace(/\/+$/, "");
}

async function refreshVolunteerHubAccessToken() {
    const refreshToken = localStorage.getItem("refresh_token");
    const provider = localStorage.getItem("refresh_token_provider");

    if (!refreshToken || (provider && provider !== "volunteerhub")) {
        throw new Error("No VolunteerHub refresh token available");
    }

    if (!refreshTokenPromise) {
        const oauthClientId =
            import.meta.env.VITE_OAUTH_CLIENT_ID || "volunteerhub-client";
        const oauthClientSecret =
            import.meta.env.VITE_OAUTH_CLIENT_SECRET || "";

        refreshTokenPromise = axios
            .post(
                `${resolveAuthBase()}/oauth2/token`,
                new URLSearchParams({
                    grant_type: "refresh_token",
                    refresh_token: refreshToken,
                }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        Authorization:
                            "Basic " + btoa(`${oauthClientId}:${oauthClientSecret}`),
                    },
                }
            )
            .then((response) => {
                const tokenData = response.data;

                if (!tokenData?.access_token) {
                    throw new Error("Refresh token response did not include access_token");
                }

                localStorage.setItem("token", tokenData.access_token);
                localStorage.setItem("access_token", tokenData.access_token);

                if (tokenData.refresh_token) {
                    localStorage.setItem("refresh_token", tokenData.refresh_token);
                    localStorage.setItem("refresh_token_provider", "volunteerhub");
                }

                return tokenData.access_token;
            })
            .finally(() => {
                refreshTokenPromise = null;
            });
    }

    return refreshTokenPromise;
}

//REQUEST INTERCEPTOR
axiosClient.interceptors.request.use(
    (config) => {
        // Lấy token từ localStorage (giống cách bạn làm trong getInitialUser)
        const token = localStorage.getItem("token");
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

            const refreshToken = localStorage.getItem("refresh_token");

            if (refreshToken) {
                try {
                    const newAccessToken = await refreshVolunteerHubAccessToken();
                    originalRequest.headers = originalRequest.headers || {};
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return axiosClient(originalRequest);
                } catch (refreshError) {
                    console.warn("Refresh token không hợp lệ hoặc đã hết hạn.", refreshError);
                }
            }

            console.warn("Token hết hạn hoặc không hợp lệ. Đang logout...");

            await useAuthStore.getState().logout();

            //Điều hướng về trang landing
            window.location.href = "/";
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
