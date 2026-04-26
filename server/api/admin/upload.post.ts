// server/api/admin/upload.post.ts
import { v2 as cloudinary } from 'cloudinary'
import formidable from 'formidable'
import fs from 'fs'

// 1. Configura o Cloudinary com suas credenciais
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

export default defineEventHandler(async (event) => {
  // Segurança: Só admin faz upload
  requireRole(event, ['ADMIN', 'SUPER_ADMIN'])

  // 2. Prepara o Formidable para ler o arquivo do request
  const form = formidable({ 
    multiples: false,
    keepExtensions: true // Ajuda a manter a extensão do arquivo
  })

  try {
    // 3. Processa o parse da requisição de forma assíncrona
    const data = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>(
      (resolve, reject) => {
        form.parse(event.node.req, (err, fields, files) => {
          if (err) reject(err)
          resolve({ fields, files })
        })
      }
    )

    // 4. Pega o arquivo de imagem
    const file = data.files.image as formidable.File | undefined
    if (!file || Array.isArray(file)) {
      throw createError({ statusCode: 400, message: 'Nenhuma imagem enviada.' })
    }

    // 5. Faz o upload para o Cloudinary usando a rota do arquivo temporário
    const uploadResponse = await cloudinary.uploader.upload(file.filepath, {
      folder: 'menuflow/products', // Organiza em pastas no Cloudinary
      resource_type: 'image'
    })

    // 6. Retorna a URL segura gerada
    return {
      url: uploadResponse.secure_url
    }

  } catch (error) {
    console.error('Erro no upload:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Falha ao processar upload da imagem.'
    })
  }
})