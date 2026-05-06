import * as yup from "yup";

const phoneRegex = /^(\+?[0-9]{7,15}|0[0-9]{9,14})$/;

const profileSchema = yup.object({
    name: yup.string().nullable(),
    fullName: yup.string().nullable(),
    email: yup.string().email("Invalid email address").nullable(),
    avatarUrl: yup
        .string()
        .trim()
        .url("Avatar must be a valid URL")
        .required("Profile photo is required."),
    bio: yup.string().trim().required("Bio cannot be empty."),
    phoneNumber: yup
        .string()
        .trim()
        .matches(phoneRegex, "Phone number is invalid.")
        .required("Phone number is required."),
    dateOfBirth: yup
        .string()
        .trim()
        .required("Date of birth is required."),
    address: yup.object({
        province: yup
            .string()
            .trim()
            .required("Please select a province."),
        district: yup
            .string()
            .trim()
            .required("Please select a district."),
        street: yup
            .string()
            .trim()
            .required("Street address is required."),
    }).required("Address is required."),
    skills: yup
        .array()
        .of(yup.string().trim().min(1, "Skill cannot be empty."))
        .min(1, "Please add at least one skill."),
    role: yup.string().nullable(),
    totalEvents: yup.number().nullable(),
    status: yup.string().nullable(),
    createdAt: yup.mixed().nullable(),
    updatedAt: yup.mixed().nullable(),
});

export default profileSchema;
