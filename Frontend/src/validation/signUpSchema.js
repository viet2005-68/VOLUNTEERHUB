import * as yup from "yup";
import { ROLES } from "../constant/role";

const signUpSchema = yup.object().shape({
    username: yup.string().required("Username is required"),
    name: yup.string().required(),
    email: yup.string().email("Invalid email").required(),
    password: yup.string().min(6).required(),
    confirmPassword: yup.string()
        .oneOf([yup.ref("password"), null], "Passwords must match"),
    roles: yup.string().oneOf([ROLES.ADMIN, ROLES.MANAGER, ROLES.USER], "Invalid role").required("Role is required"),
    bio: yup.string(),
    avatarUrl: yup.string().url(),
    preferences: yup.string(),
});

export default signUpSchema;
