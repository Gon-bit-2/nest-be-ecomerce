import { createZodDto } from 'nestjs-zod'
import {
  PresignedUploadFileBodySchema,
  PresignedUploadFileResSchema,
  UploadFilesResSchema,
} from 'src/media/media.model'

export class PresignedUploadFileBodyDTO extends createZodDto(PresignedUploadFileBodySchema) {}

export class UploadedFilesDTO extends createZodDto(UploadFilesResSchema) {}

export class PresignedUploadFileResDTO extends createZodDto(PresignedUploadFileResSchema) {}
