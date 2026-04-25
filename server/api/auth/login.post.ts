import bcrypt from 'bcrypt'
import { SignJWT } from 'jose'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  // 1. Busca o usuário
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    throw createError({ statusCode: 401, message: 'Usuário não encontrado.' })
  }

  // 2. Valida a senha
  const isPasswordCorrect = await bcrypt.compare(password, user.password)
  if (!isPasswordCorrect) {
    throw createError({ statusCode: 401, message: 'Senha incorreta.' })
  }

  // 3. Prepara a chave secreta para o 'jose'
  const secret = new TextEncoder().encode(process.env.JWT_SECRET)

  // 4. Gera o Token
  const token = await new SignJWT({ 
    userId: user.id, 
    role: user.role, 
    brandId: user.brandId 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)

  return {
    token,
    user: { name: user.name, email: user.email, role: user.role }
  }
})