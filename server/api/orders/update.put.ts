import { PrismaClient } from '@prisma/client';
import { geocodeAddress } from '~/server/utils/geocode';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // Assumimos que o ID da loja e os dados vêm no corpo da requisição.
  // Em um cenário real, você pode pegar o ID da URL (ex: /api/brands/[id])
  const body = await readBody(event);
  const { id, address, ...dataToUpdate } = body;

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'O ID da loja é obrigatório.',
    });
  }

  // Objeto que conterá os dados finais para atualização
  const finalData: any = { ...dataToUpdate };

  // --- LÓGICA DE GEOCODIFICAÇÃO ---
  // Se um novo endereço foi fornecido, tentamos geocodificá-lo.
  if (address) {
    // Adiciona o endereço aos dados a serem atualizados
    finalData.address = address;

    const coordinates = await geocodeAddress(address);

    if (coordinates) {
      // Se a geocodificação for bem-sucedida, adiciona lat/lng aos dados
      finalData.latitude = coordinates.lat;
      finalData.longitude = coordinates.lng;
    } else {
      // Se falhar, você pode decidir o que fazer:
      // 1. Impedir a atualização e retornar um erro. (Recomendado)
      // 2. Salvar o endereço mas deixar lat/lng como nulos.
      throw createError({
        statusCode: 400,
        message: `Não foi possível encontrar as coordenadas para o endereço: "${address}". Verifique se está correto.`,
      });
    }
  }

  // Atualiza a loja no banco de dados com todos os dados
  return prisma.brand.update({ where: { id }, data: finalData });
});