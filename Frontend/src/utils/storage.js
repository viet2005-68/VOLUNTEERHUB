// src/utils/storage.js

const storage = {
    setUser(user) {
        try {
            const data = JSON.stringify(user);
            localStorage.setItem("user", data);
        } catch (error) {
            console.error("Lỗi khi lưu user vào localStorage:", error);
        }
    },

    getUser() {
        try {
            const data = localStorage.getItem("user");
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error("Lỗi khi đọc user từ localStorage:", error);
            return null;
        }
    },

    clearUser() {
        try {
            localStorage.removeItem("user");
        } catch (error) {
            console.error("Lỗi khi xóa user khỏi localStorage:", error);
        }
    },

    setToken(token) {
        localStorage.setItem("token", token);
    },

    getToken() {
        return localStorage.getItem("token");
    },

    clearToken() {
        localStorage.removeItem("token");
    },
};

export default storage;
