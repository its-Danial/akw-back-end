import { HttpContext } from '@adonisjs/core/http'
import Entry from '#models/entry'

import FileService from '#providers/file_service_provider'

export default class EntryController {
  private fileService = new FileService()

  async create({ request, auth, response }: HttpContext) {
    const user = await auth.use('api').authenticate()

    try {
      const { name } = request.all()
      const image = request.files('image')[0]

      const imagePath = await this.fileService.saveFile(image, 'uploads')

      const entry = await user
        .related('entries')
        .create({ userId: user.id, name, image_path: imagePath })

      return response.created({ entry })
    } catch (e) {
      return { message: 'error', error: e }
    }
  }

  async get({ auth, response }: HttpContext) {
    const user = await auth.use('api').authenticate()
    try {
      const entries = await user.related('entries').query().orderBy('created_at', 'desc')
      return response.ok({ entries })
    } catch (e) {
      return response.notFound({ message: 'error', error: e })
    }
  }

  async update({ params, request, auth, response }: HttpContext) {
    const user = await auth.use('api').authenticate()
    const entry = await Entry.findOrFail(params.id)

    if (entry.userId !== user.id) {
      return response.unauthorized({ message: 'You cannot edit this entry' })
    }

    try {
      const { name } = request.all()
      const image = request.files('image')[0]

      const newImagePath = await this.fileService.saveFile(image, 'uploads')

      const oldImagePath = entry.image_path

      entry.name = name
      entry.image_path = newImagePath
      await entry.save()

      await this.fileService.deleteFile(oldImagePath)

      return response.ok({ entry })
    } catch (e) {
      console.error('Error updating entry:', e)
      return response.badRequest({ message: 'Error updating entry', error: e.message })
    }
  }

  async delete({ params, auth, response }: HttpContext) {
    const user = await auth.use('api').authenticate()
    const entry = await Entry.findOrFail(params.id)

    if (entry.userId !== user.id) {
      return response.unauthorized({ message: 'You cannot delete this entry' })
    }

    await this.fileService.deleteFile(entry.image_path)

    try {
      await entry.delete()
      return response.ok({ message: 'Entry deleted successfully' })
    } catch (e) {
      return response.badRequest({ message: 'error', error: e })
    }
  }
}
