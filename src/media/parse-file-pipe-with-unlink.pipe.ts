import { ParseFileOptions, ParseFilePipe } from '@nestjs/common'
import { unlink } from 'fs'

export class ParseFilePipeWithUnlink extends ParseFilePipe {
  constructor(options?: ParseFileOptions) {
    super(options)
  }
  async transform(files: Array<Express.Multer.File>): Promise<any> {
    return super.transform(files).catch(async (error) => {
      await Promise.all(
        files.map((file: Express.Multer.File) => {
          unlink(file.path, (err) => {
            if (err) {
              console.error('Error deleting file:', err)
            }
          })
        }),
      )
      throw error
    })
  }
}
