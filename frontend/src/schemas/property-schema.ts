import { z } from "zod";

const propertySchema = z.object({
    floor: z
        .preprocess((val) => {
            if (val === null || val === undefined) {
                return null;
            }
        
            const parsed = parseInt(val as string, 10);
            if (isNaN(parsed)) {
                throw new z.ZodError([
                    {
                        code: "custom",
                        message: "Етажът трябва да бъде число.",
                        path: ["floor"],
                    },
                ]);
            }
            return parsed;
        }, z.union([z.number(), z.null()]))
        .refine(
            (val) => val === null || (val > 0 && Number.isInteger(val)),
            { message: "Етажът трябва да бъде положително цяло число." }
        ),
    address: z.object({
        city: z.string().min(1, { message: "Градът не може да бъде празен." }),
        street: z.string().min(1, { message: "Улицата не може да бъде празна." }),
        neighborhood: z.string().nullable(),
    }),
    phoneNumber: z
        .string()
        .regex(/^\+?\d[\d\s]{8,15}$/, {
            message: "Телефонният номер трябва да бъде валиден номер.",
        }),
    email: z.string().email({
        message: "Моля, въведете валиден имейл адрес.",
    }),
    name: z.string().min(1, {
        message: "Името не може да бъде празно.",
    }),
    description: z
        .string()
        .min(64, {
            message: "Описанието е прекалено кратко.",
        })
        .max(2048, {
            message: "Описанието е прекалено дълго.",
        }),
    resources: z.object({
        headerImage: z
            .string()
            .min(1, {
                message: "Грешка при заглавното изображение.",
            })
            .or(z.undefined())
            .refine((value) => value !== undefined, {
                message: "Трябва да има заглавна снимка.",
            }),

        galleryImages: z
            .array(
                z.string().min(1, {
                    message: "Грешка при изображение в галерията.",
                })
            ).min(1, {
                message: "Трябва да има минимум едно изображение.",
            }).max(10, {
                message: "Може да имате максимум 10 изображения.",
            }),
        visualizationFolder: z.string().nullable(),
    }),
});

z.setErrorMap((issue, _ctx) => {
    if (issue.message) {
        return { message: issue.message };
    } else {
        return { message: "Невалидни данни." };
    }
});

export default propertySchema;