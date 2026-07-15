export default defineEventHandler((event) => {
  const host = getRequestHeader(event, 'host')
  const path = event.path

  // Defina o domínio sem o https://
  const isTargetDomain = host === 'www.deejaysburguer.com.br' || host === 'deejaysburguer.com.br'

  if (isTargetDomain && path === '/') {
    return sendRedirect(event, '/deejays-burguer', 301)
  }
})