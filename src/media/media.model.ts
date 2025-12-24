import z from 'zod'

export const PresignedUploadFileBodySchema = z
  .object({
    fileName: z.string().min(1),
    fileSize: z
      .string()
      .min(1)
      .max(5 * 1024 * 1024), //max 5MB
  })
  .strict()

export const UploadFilesResSchema = z.object({
  data: z.array(
    z.object({
      url: z.string(),
    }),
  ),
})

export const PresignedUploadFileResSchema = z.object({
  presignedUrl: z.string(),
  url: z.string(),
})

export type PresignedUploadFileBodyType = z.infer<typeof PresignedUploadFileBodySchema>
