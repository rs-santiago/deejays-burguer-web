// server/api/admin/users/index.get.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 1. Validação: Apenas SUPER_ADMIN pode ver a lista de todos os usuários
  requireRole(event, ['SUPER_ADMIN'])

  try {
    // 2. Busca os usuários e faz um "Join" com as Lojas (Brands) permitidas
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        // Busca a relação intermediária e extrai apenas o ID e Nome da Loja
        brands: {
          select: {
            brand: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc' // Ordena por ordem alfabética
      }
    })

    return users

  } catch (error) {
    console.error('Erro ao listar usuários:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro interno ao buscar a lista de usuários.'
    })
  }
})