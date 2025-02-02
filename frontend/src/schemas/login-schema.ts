import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email({
        message: "Невалиден имейл адрес.",
    }),
    password: z.string().min(6, {
        message: "Паролата трябва да е поне 6 символа.",
    }),
});

export default loginSchema;