import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
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
            toast.success("Account created successfully. Please sign in.");

            // User profile is created after OAuth login completes and a token exists.
            window.location.href = LOGIN_LINK;
        },
        onError: (error) => {
            const message = error?.response?.data?.message || error?.message || "Sign up failed. Please try again.";
            console.error("Sign up failed:", message);
            toast.error(message);
        },
    });
};

export default useSignUp;
