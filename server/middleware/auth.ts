import { jwtVerify } from 'jose'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]

    if (!token) return
    
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)
      
      // Injeta os dados do usuário no contexto para as rotas usarem
      event.context.user = payload
    } catch (e) {
      event.context.user = null
    }
  }
})