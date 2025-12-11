import z from 'zod'
import { languageSchema } from '../shared/model/share-language.model'

export const GetLanguageResSchema = z.object({
  data: z.array(languageSchema),
  totalItems: z.number(),
})
export const GetLanguageParamsSchema = z
  .object({
    languageId: z.string().max(10),
  })
  .strict()
export const GetLanguageDetailResSchema = languageSchema
export const CreateLanguageSchema = languageSchema
  .pick({
    id: true,
    name: true,
  })
  .strict()
export const UpdateLanguageSchema = languageSchema
  .pick({
    name: true,
  })
  .strict()
export type GetLanguageResType = z.infer<typeof GetLanguageResSchema>
export type GetLanguageParamsType = z.infer<typeof GetLanguageParamsSchema>
export type GetLanguageDetailResType = z.infer<typeof GetLanguageDetailResSchema>
export type CreateLanguageType = z.infer<typeof CreateLanguageSchema>
export type UpdateLanguageType = z.infer<typeof UpdateLanguageSchema>
