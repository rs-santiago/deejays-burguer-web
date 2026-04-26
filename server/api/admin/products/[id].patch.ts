export default defineEventHandler(async (event) => {
  requireRole(event, ['ADMIN', 'SUPER_ADMIN']);
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  // Atualiza apenas o que foi enviado (ex: price ou available)
  const product = await prisma.product.update({
    where: { id },
    data: {
      price: body.price,
      isAvailable: body.isAvailable,
    },
  });

  return product;
});