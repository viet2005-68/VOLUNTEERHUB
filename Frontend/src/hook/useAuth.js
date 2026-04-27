// src/hooks/useAuth.js
import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
    const user = useAuthStore((state) => state.user);
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);
    const hasRole = useAuthStore((state) => state.hasRole);
    const hasAnyRole = useAuthStore((state) => state.hasAnyRole);

    return { user, login, logout, hasRole, hasAnyRole };
};
