export default defineEventHandler((event) => {
  const host = getRequestHeader(event, 'host')
  const path = event.path

  console.log(`Host: ${host}, Path: ${path}`);

  // Substitua pelo domínio que deve ser redirecionado
  const targetDomain = 'https://www.deejaysburguer.com.br'

  if (host === targetDomain && path === '/') {
    return sendRedirect(event, '/deejays-burguer', 301)
  }
})