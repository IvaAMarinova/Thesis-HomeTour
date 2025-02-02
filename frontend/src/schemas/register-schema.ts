import { z } from "zod";

const registerSchema = z.object({
    fullName: z.string().min(2, {
        message: "Пълното име трябва да е поне 2 символа.",
    }),
    email: z.string().email({
        message: "Невалиден имейл адрес.",
    }),
    password: z.string().min(6, {
        message: "Паролата трябва да е поне 6 символа.",
    }),
});

export default registerSchema;