import { H3Event } from 'h3'

export const requireRole = (event: H3Event, allowedRoles: string[]) => {
  const user = event.context.user

  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autenticado.' })
  }

  if (!allowedRoles.includes(user.role)) {
    throw createError({ statusCode: 403, message: 'Sem permissão.' })
  }

  return user
}