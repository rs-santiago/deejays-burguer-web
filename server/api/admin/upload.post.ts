// server/api/admin/upload.post.ts
import { v2 as cloudinary } from 'cloudinary'
import formidable from 'formidable'
import fs from 'fs'
import os from 'os'

// 1. Configura o Cloudinary com suas credenciais
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

export default defineEventHandler(async (event) => {
  requireRole(event, ['ADMIN', 'SUPER_ADMIN'])

  // 1. Lê o corpo multipart de forma nativa
  const formData = await readMultipartFormData(event)

  if (!formData) {
    throw createError({ statusCode: 400, message: 'Nenhuma imagem enviada.' })
  }

  // 2. Procura pelo campo 'image'
  const file = formData.find((item) => item.name === 'image')

  if (!file || !file.data) {
    throw createError({ statusCode: 400, message: 'Campo image não encontrado.' })
  }

  try {
    // 3. Upload direto para o Cloudinary usando o Buffer (sem precisar de arquivo temporário)
    const uploadResponse = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'menuflow/products' },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      stream.end(file.data)
    })

    return { url: (uploadResponse as any).secure_url }

  } catch (error: any) {
    console.error('Erro Cloudinary:', error)
    throw createError({ statusCode: 500, message: 'Erro ao subir para nuvem.' })
  }
})