import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 1. Proteção de Rota (Apenas Super Admin)
  requireRole(event, ['SUPER_ADMIN']) 

  const body = await readBody(event)
  const { name, slug, ...rest } = body

  // 2. Validação Básica
  if (!name || !slug) {
    throw createError({
      statusCode: 400,
      message: 'Nome e slug são obrigatórios.'
    })
  }

  try {
    // 3. Verifica se o slug (Link) já está em uso por outra loja
    const existingBrand = await prisma.brand.findUnique({
      where: { slug }
    })

    if (existingBrand) {
      throw createError({
        statusCode: 409, // 409 = Conflict
        message: 'Já existe uma loja com este link (slug). Escolha outro.'
      })
    }

    // 4. Salva a nova loja no banco com os dados do template
    const newBrand = await prisma.brand.create({
      data: {
        name,
        slug,
        ...rest // Espalha o resto dos campos (heroTitle, colorPrimary, etc)
      }
    })

    return newBrand

  } catch (error: any) {
    console.error('Erro ao criar loja (Prisma):', error)
    
    // Se o erro foi lançado por nós (400, 409), repassa ele
    if (error.statusCode) {
      throw error
    }

    // Erro genérico do servidor
    throw createError({
      statusCode: 500,
      message: 'Erro interno ao tentar criar a loja no banco de dados.'
    })
  }
})