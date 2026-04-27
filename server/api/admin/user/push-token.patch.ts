import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Agora pegamos o userId direto do corpo que o App enviou
  if (!body.userId || !body.token) {
    throw createError({ statusCode: 400, message: 'Faltam dados' })
  }

  await prisma.user.update({
    where: { id: body.userId },
    data: { pushToken: body.token }
  })

  return { success: true }
})