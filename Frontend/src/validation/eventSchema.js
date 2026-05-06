import * as yup from "yup";

const eventSchema = yup.object({
    name: yup.string().trim().required("Event title is required."),
    categoryName: yup.string().required("Please select a category."),
    description: yup.string().trim().min(20, "Describe at least 20 characters."),
    startTime: yup.date().required(),
    endTime: yup
        .date()
        .min(yup.ref("startTime"), "End time must be after start time.")
        .required(),
    capacity: yup
        .number()
        .typeError("Capacity must be a number.")
        .integer()
        .positive()
        .required(),
    registrationDeadline: yup.date().required(),
    street: yup.string().trim().required(),
    district: yup.string().trim().required(),
    province: yup.string().trim().required(),
});

export default eventSchema;