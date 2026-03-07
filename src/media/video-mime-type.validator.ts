import { FileValidator } from '@nestjs/common'

export class VideoMimeTypeValidator extends FileValidator {
  private allowedMimeTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska']

  constructor(options?: { allowedMimeTypes?: string[] }) {
    super(options || {})
    if (options?.allowedMimeTypes) {
      this.allowedMimeTypes = options.allowedMimeTypes
    }
  }

  isValid(file?: Express.Multer.File): boolean {
    if (!file) return false
    return this.allowedMimeTypes.includes(file.mimetype)
  }

  buildErrorMessage(file: Express.Multer.File): string {
    return `File type not allowed. Current type: ${file.mimetype}. Allowed types: ${this.allowedMimeTypes.join(', ')}`
  }
}
