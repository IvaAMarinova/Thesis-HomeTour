import { z } from "zod";

const companySchema = z.object({
  phoneNumber: z.string().regex(/^\+?\d[\d\s]{8,15}$/, {
    message: "Телефонният номер трябва да бъде валиден номер.",
  }),
  email: z.string().email({
    message: "Моля, въведете валиден имейл адрес.",
  }),
  name: z
    .string()
    .min(1, {
      message: "Името не може да бъде празно.",
    })
    .max(100, {
      message: "Името е прекалено дълго.",
    }),
  website: z.string().url({
    message: "Моля, въведете валиден уеб адрес.",
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
    logoImage: z
      .string()
      .min(1, {
        message: "Не може да имате празно поле за лого.",
      })
      .or(z.undefined())
      .refine((value) => value !== undefined, {
        message: "Трябва да има лого изображение.",
      }),
    galleryImage: z
      .string()
      .min(1, {
        message: "Не може да имате празно поле за галерия.",
      })
      .or(z.undefined())
      .refine((value) => value !== undefined, {
        message: "Трябва да има снимка на компанията.",
      }),
  }),
});

z.setErrorMap((issue, _ctx) => {
  if (issue.message) {
    return { message: issue.message };
  } else {
    return { message: "Невалидни данни." };
  }
});

export default companySchema;
