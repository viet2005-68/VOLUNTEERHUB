import { useMutation } from "@tanstack/react-query";
import { registerAuthUser } from "../services/authService";

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

            // 3. Redirect sang OAuth2 login
            window.location.href =
                `${import.meta.env.VITE_API_LOGIN}/oauth2/authorize` +
                `?response_type=${import.meta.env.VITE_OAUTH_RESPONSE_TYPE}` +
                `&client_id=${import.meta.env.VITE_OAUTH_CLIENT_ID}` +
                `&scope=${import.meta.env.VITE_OAUTH_SCOPE}` +
                `&redirect_uri=${import.meta.env.VITE_OAUTH_REDIRECT_URI}`;
        },
        onError: (error) => {
            console.error("Sign up failed:", error.response?.data || error.message);
            alert("Sign up failed: " + (error.response?.data?.message || error.message));
        },
    });
};

export default useSignUp;
