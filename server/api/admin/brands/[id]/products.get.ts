// server/api/admin/brands/[id]/products.get.ts
export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['ADMIN', 'SUPER_ADMIN']);
  const brandId = getRouterParam(event, 'id');

  // Nova Segurança Multi-Tenant:
  // Se não for Super Admin E o array de lojas do usuário NÃO incluir essa marca solicitada
  if (user.role !== 'SUPER_ADMIN' && !user.brandIds?.includes(brandId)) {
    throw createError({ statusCode: 403, message: 'Acesso negado a esta loja.' });
  }

  const products = await prisma.product.findMany({
    where: { brandId },
    orderBy: { name: 'asc' }
  });

  return products;
});