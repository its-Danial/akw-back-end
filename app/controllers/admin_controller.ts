import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Permission from '#models/permission'

export default class AdminController {
  async listUsers({ response, auth }: HttpContext) {
    const user = await auth.use('api').authenticate()

    if (user.role !== 'admin') {
      return response.unauthorized({ message: 'You cannot edit this entry' })
    }

    const users = await User.query().preload('permissions')
    return response.ok({ users })
  }

  async updateUserPermissions({ params, request, response, auth }: HttpContext) {
    const user = await auth.use('api').authenticate()
    if (user.role !== 'admin') {
      return response.unauthorized({ message: 'You cannot edit this entry' })
    }
    const targetUser = await User.findOrFail(params.id)
    const data = request.only(['can_view', 'can_edit', 'can_delete', 'can_view_all'])
    let permission = await Permission.findByOrFail('userId', targetUser.id)

    permission.merge(data)
    await permission.save()
    return response.ok({ permission })
  }
}
