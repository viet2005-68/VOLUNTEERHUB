import { useMutation } from "@tanstack/react-query";
import { registerAuthUser } from "../services/authService";
import { LOGIN_LINK } from "../constant/constNavigate";

const useSignUp = () => {
    return useMutation({
        mutationFn: async (data) => {
            console.log("Signing up user with data:", data);
            // 1. Gọi AuthService để tạo tài khoản xác thực
            // UserService sẽ được gọi sau khi OAuth2 login thành công (có token)
            const authUser = await registerAuthUser(data);

            return { authUser };
        },
        onSuccess: (data) => {
            console.log("Sign up successful:", data);

            // User profile is created after OAuth login completes and a token exists.
            window.location.href = LOGIN_LINK;
        },
        onError: (error) => {
            console.error("Sign up failed:", error.response?.data || error.message);
            alert("Sign up failed: " + (error.response?.data?.message || error.message));
        },
    });
};

export default useSignUp;
