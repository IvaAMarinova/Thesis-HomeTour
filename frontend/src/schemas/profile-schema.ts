import { z } from "zod";

const profileSchema = z.object({
    fullName: z.string().min(2, {
        message: "Пълното име трябва да има поне две букви.",
    })
});

export default profileSchema;