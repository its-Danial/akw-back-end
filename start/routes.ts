/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import { sep, normalize } from 'node:path'
import app from '@adonisjs/core/services/app'
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
const EntryController = () => import('#controllers/entries_controller')
const AdminController = () => import('#controllers/admin_controller')
const UserController = () => import('#controllers/users_controller')

const PATH_TRAVERSAL_REGEX = /(?:^|[\\/])\.\.(?:[\\/]|$)/

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.post('/register', [UserController, 'register']).as('user.register')
router.post('/login', [UserController, 'login']).as('user.login')
router.delete('/logout', [UserController, 'logout']).as('user.logout').use(middleware.auth())

router
  .group(() => {
    router.post('', [EntryController, 'create'])
    router.get('', [EntryController, 'get']).use(middleware.permission(['can_view']))
    router.put('/:id', [EntryController, 'update']).use(middleware.permission(['can_edit']))
    router.delete('/:id', [EntryController, 'delete']).use(middleware.permission(['can_delete']))
  })
  .prefix('entry')
  .use(middleware.auth())

router
  .group(() => {
    router.get('users', [AdminController, 'listUsers'])
    router.put('update-user/:id', [AdminController, 'updateUserPermissions'])
  })
  .use(middleware.auth())

// Fetch saves images
router.get('/uploads/*', ({ request, response }) => {
  const filePath = request.param('*').join(sep)
  const normalizedPath = normalize(filePath)

  if (PATH_TRAVERSAL_REGEX.test(normalizedPath)) {
    return response.badRequest('Malformed path')
  }

  const absolutePath = app.makePath('uploads', normalizedPath)
  return response.download(absolutePath)
})
