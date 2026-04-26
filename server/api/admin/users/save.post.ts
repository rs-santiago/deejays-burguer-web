import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  requireRole(event, ['SUPER_ADMIN'])
  const body = await readBody(event)
  const { id, name, email, password, role, brandIds } = body

  try {
    let user;

    if (id) {
      // ATUALIZAÇÃO
      const updateData: any = { name, email, role }
      if (password) updateData.password = await bcrypt.hash(password, 10)

      user = await prisma.$transaction(async (tx) => {
        const u = await tx.user.update({ where: { id }, data: updateData })
        // Sincroniza Lojas: Remove tudo e adiciona as novas marcadas
        await tx.userBrandAccess.deleteMany({ where: { userId: id } })
        if (brandIds?.length > 0) {
          await tx.userBrandAccess.createMany({
            data: brandIds.map((bId: string) => ({ userId: id, brandId: bId }))
          })
        }
        return u
      })
    } else {
      // CRIAÇÃO
      const hashedPassword = await bcrypt.hash(password, 10)
      user = await prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
          data: { 
            name, email, role, password: hashedPassword,
            brands: {
              create: brandIds.map((bId: string) => ({ brandId: bId }))
            }
          }
        })
        return u
      })
    }

    return user
  } catch (error: any) {
    throw createError({ statusCode: 400, message: 'E-mail já cadastrado ou erro no banco.' })
  }
})