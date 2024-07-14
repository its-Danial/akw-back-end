import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { loginValidator, registerValidator } from '#validators/auth'
import Permission from '#models/permission'

export default class UserController {
  async register({ request }: HttpContext) {
    const data = await request.validateUsing(registerValidator)
    const user = await User.create({ ...data, role: 'user' })

    const permission = await user.related('permissions').create({
      userId: user.id,
      can_view: true,
      can_edit: true,
      can_delete: true,
      can_view_all: false,
    })

    const token = await User.accessTokens.create(user)

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      permission: {
        canView: permission.can_view,
        canEdit: permission.can_edit,
        canDelete: permission.can_delete,
        canViewAll: permission.can_view_all,
      },
      token: token.value!.release(),
    }
  }

  async login({ request }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(email, password)
    const permission = await Permission.findByOrFail('userId', user.id)

    const token = await User.accessTokens.create(user)

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      permission: {
        canView: permission.can_view,
        canEdit: permission.can_edit,
        canDelete: permission.can_delete,
        canViewAll: permission.can_view_all,
      },
      token: token.value!.release(),
    }
  }

  async logout({ auth }: HttpContext) {
    const user = await auth.use('api').authenticate()
    try {
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
      return { message: 'success' }
    } catch (e) {
      return { message: 'error', error: e }
    }
  }
}
