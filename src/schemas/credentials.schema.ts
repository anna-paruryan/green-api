//src/schemas/credentials.schema.ts
import { z } from "zod"

export const credentialsSchema = z.object({
    idInstance: z
        .string()
        .trim()
        .min(1, "ID Instance is required")
        .regex(
            /^\d+$/,
            "ID Instance must contain only digits",
        ),

    apiTokenInstance: z
        .string()
        .trim()
        .min(1, "API Token is required")
        .refine(
            (value) => !/\s/.test(value),
            "API Token must not contain spaces",
        ),
})

export type CredentialsFormValues =
    z.infer<typeof credentialsSchema>
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
export const ACCEPTED_FILE_TYPES = [...ACCEPTED_IMAGE_TYPES, "video/mp4", "audio/mpeg", "application/pdf"]

export const chatInputSchema = z.object({
    text: z.string().max(2000, "Слишком длинное сообщение").optional(),
    file: z
        .instanceof(File)
        .optional()
        .refine((file) =>!file || file.size <= 20 * 1024 * 1024, "Макс 20MB")
        .refine((file) =>!file || ACCEPTED_FILE_TYPES.includes(file.type), "Неподдерживаемый формат"),
}).refine((data) => Boolean(data.text?.trim() || data.file), {
    message: "Введите текст или прикрепите файл",
    path: ["text"],
})

export type ChatInputValues = z.infer<typeof chatInputSchema>