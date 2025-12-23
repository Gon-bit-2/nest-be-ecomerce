import { v4 as uuidv4 } from 'uuid'
import path from 'path'
/**
 *
 * @param originalFileName
 * @returns
 */
export const generateUniqueFileName = (originalFileName: string) => {
  const fileExtension = path.extname(originalFileName)
  const uniqueId = uuidv4()
  return `${uniqueId}${fileExtension}`
}
