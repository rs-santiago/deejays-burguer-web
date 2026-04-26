// server/api/admin/users/index.get.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 1. VALIDAÇÃO DE SEGURANÇA (GUARDIÃO)
    // Se o usuário não for SUPER_ADMIN, a função requireRole deve jogar um erro 403 (Forbidden)
    // e parar a execução imediatamente. Lojistas normais não passam daqui.
    const currentUser = requireRole(event, ['SUPER_ADMIN'])

    // 2. BUSCA OTIMIZADA NO PRISMA
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        // Busca a relação na tabela pivô (UserBrandAccess) e extrai a loja (Brand)
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
        name: 'asc' // Lista por ordem alfabética para facilitar a gestão
      }
    })

    return users

  } catch (error: any) {
    console.error('Erro na rota de listagem de usuários:', error)
    
    // Se o erro for do requireRole (ex: 401 Unauthorized ou 403 Forbidden), repassamos ele
    if (error.statusCode) {
      throw error
    }

    // Se for erro do Prisma ou Banco de Dados, geramos um erro 500 genérico
    // para não vazar informações sensíveis do SQL para o frontend
    throw createError({
      statusCode: 500,
      message: 'Erro interno ao tentar listar os usuários do sistema.'
    })
  }
})