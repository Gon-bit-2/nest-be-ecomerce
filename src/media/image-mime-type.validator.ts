import { FileValidator } from '@nestjs/common'

export class ImageMimeTypeValidator extends FileValidator {
  private allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

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
