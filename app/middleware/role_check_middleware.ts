import type { HttpContext } from '@adonisjs/core/http'

export default class RoleCheckMiddleware {
  async handle({ auth, response }: HttpContext, next: () => Promise<void>, allowedRoles: string[]) {
    const user = await auth.use('api').authenticate()

    if (user.role !== 'admin') {
      return response.forbidden('You do not have permission to perform this action')
    }
    else {
      console.log(user.permissions);
    }

    await next()
  }
}
