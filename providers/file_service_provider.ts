// start/services/FileService.ts
import { promises as fs } from 'node:fs'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'

export default class FileService {
  /**
   * Save a file to the specified directory
   * @param file - The file to be saved
   * @param directory - The directory where the file should be saved
   * @returns The file path of the saved file
   */
  async saveFile(file: any, directory: string): Promise<string> {
    const fileName = `${cuid()}.${file.extname}`
    await file.move(app.makePath(directory), {
      name: fileName,
    })
    return `${directory}/${fileName}`
  }

  /**
   * Delete a file from the specified path
   * @param filePath - The path of the file to be deleted
   */
  async deleteFile(filePath: string): Promise<void> {
    console.log('=>(file_service_provider.ts:26) filePath', filePath)
    const fullPath = app.makePath(filePath)
    try {
      await fs.access(fullPath)
      await fs.unlink(fullPath)
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err
      }
    }
  }
}
