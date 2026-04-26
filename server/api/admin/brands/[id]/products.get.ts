// server/api/admin/brands/[id]/products.get.ts
export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['ADMIN', 'SUPER_ADMIN']);
  const brandId = getRouterParam(event, 'id');

  // Segurança: Se não for Super Admin, ele só pode ver a própria marca
  if (user.role !== 'SUPER_ADMIN' && user.brandId !== brandId) {
    throw createError({ statusCode: 403, message: 'Acesso negado' });
  }

  const products = await prisma.product.findMany({
    where: { brandId },
    orderBy: { name: 'asc' }
  });

  return products;
});