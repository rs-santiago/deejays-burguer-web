export default defineEventHandler(async (event) => {
  try {
    const brandSlug = getRouterParam(event, 'slug')
    if (!brandSlug) {
      throw createError({ statusCode: 400, message: 'Brand slug is required' })
    }
    const brand = await prisma.brand.findUnique({
      where: { slug: brandSlug }
    })
    if (!brand) {
      throw createError({ statusCode: 404, message: 'Brand not found' })
    }
    return {
      id: brand.id,
      name: brand.name,
      surname: brand.surname,
      tagline: brand.tagline,
      hero: {
        title: brand.heroTitle,
        highlight: brand.heroHighlight,
        description: brand.heroDescription,
        image: brand.heroImage
      },
      about: {
        title: brand.aboutTitle,
        highlight: brand.aboutHighlight,
        since: brand.since,
        description: brand.aboutDescription,
        subText: brand.aboutSubText,
        features: brand.features
      },
      contact: {
        whatsapp: brand.whatsapp,
        whatsappDisplay: brand.whatsappDisplay,
        instagram: brand.instagram,
        instaLink: brand.instaLink,
        location: brand.location
      },
      colors: {
        primary: brand.colorPrimary,
        primaryHover: brand.colorPrimaryHover,
        bg: brand.colorBg
      }
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao buscar produtos',
    })
  }
})