import { useAuth } from "./useAuth";
import { ROLES } from "../constant/role";

export const useRole = () => {
    const { user } = useAuth();
    if (!user) return null;

    return {
        isAdmin: user.role === ROLES.ADMIN,
        isUser: user.role === ROLES.USER,
        isOrg: user.role === ROLES.MANAGER,
    }
}
