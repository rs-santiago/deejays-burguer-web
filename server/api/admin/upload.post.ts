// server/api/admin/upload.post.ts
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

export default defineEventHandler(async (event) => {
  requireRole(event, ['ADMIN', 'SUPER_ADMIN'])

  const formData = await readMultipartFormData(event)
  if (!formData) {
    throw createError({ statusCode: 400, message: 'Nenhuma imagem enviada.' })
  }

  const file = formData.find((item) => item.name === 'image')
  if (!file || !file.data) {
    throw createError({ statusCode: 400, message: 'Campo image não encontrado.' })
  }

  try {
    // 1. Converte o Buffer em uma string Base64 com o prefixo do tipo MIME
    // Isso garante que o Cloudinary saiba exatamente que tipo de arquivo está recebendo
    const base64Image = `data:${file.type || 'image/jpeg'};base64,${file.data.toString('base64')}`

    // 2. Upload usando a string Base64
    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: 'menuflow/products',
      resource_type: 'image'
    })

    return { url: uploadResponse.secure_url }

  } catch (error: any) {
    console.error('Erro Cloudinary:', error)
    throw createError({ statusCode: 500, message: 'Falha no processamento da imagem.' })
  }
})