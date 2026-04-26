// server/api/admin/brands/index.get.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 1. Proteção: O requireRole já valida o JWT e retorna os dados do usuário logado
    const user = requireRole(event, ['ADMIN', 'SUPER_ADMIN'])

    // 2. Definir o Filtro de Segurança
    let whereCondition = {}

    // Se NÃO for Super Admin, ele só pode ver as marcas vinculadas ao ID dele
    if (user.role !== 'SUPER_ADMIN') {
      whereCondition = {
        users: {
          some: {
            userId: user.id // Filtra marcas que possuem esse userId na tabela UserBrandAccess
          }
        }
      }
    }

    // 3. Busca as marcas com o filtro aplicado
    const brands = await prisma.brand.findMany({
      where: whereCondition, // Aplica o filtro dinâmico aqui
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        _count: {
          select: { products: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return brands

  } catch (error: any) {
    console.error('Erro ao buscar marcas:', error)
    
    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      message: 'Erro interno ao listar as unidades.'
    })
  }
})