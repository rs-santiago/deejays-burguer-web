// server/api/admin/users/[id].get.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN'])
  const id = getRouterParam(event, 'id')

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      brands: { select: { brandId: true } } // Necessário para marcar os checkboxes no App
    }
  })

  if (!user) throw createError({ statusCode: 404, message: 'Usuário não encontrado.' })
  return user
})