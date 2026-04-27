import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Aqui você pega o ID do usuário logado (depende de como você fez a autenticação)
  // Exemplo usando um header fake, mas ajuste para o seu sistema de auth (JWT, session, etc)
  const userId = getHeader(event, 'x-user-id') 

  if (!userId || !body.token) {
    throw createError({ statusCode: 400, message: 'Faltam dados' })
  }

  await prisma.user.update({
    where: { id: userId },
    data: { pushToken: body.token }
  })

  return { success: true }
})