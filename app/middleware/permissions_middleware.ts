// start/middleware/PermissionsMiddleware.ts

import { HttpContext } from '@adonisjs/core/http'
import Permission from '#models/permission'

class PermissionsMiddleware {
  async handle({ auth, response }: HttpContext, next: () => Promise<void>, guards: string[]) {
    const user = await auth.use('api').authenticate()

    const permissionKey = guards[0] // Get the permission type to check (e.g., 'can_edit', 'can_delete')

    try {
      const permission = await Permission.query()
        .where('userId', user.id)
        .andWhere(permissionKey, true)
        .first()

      if (!permission) {
        return response.unauthorized({
          message: `You do not have permission to ${permissionKey.replace('can_', '')}`,
        })
      }

      await next()
    } catch (error) {
      return response.internalServerError({
        message: 'Error checking permissions',
        error: error.message,
      })
    }
  }
}

export default PermissionsMiddleware
