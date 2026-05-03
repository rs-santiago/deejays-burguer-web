export default defineEventHandler((event) => {
  // 1. Define os cabeçalhos de permissão para TODAS as requisições
  setResponseHeaders(event, {
    "Access-Control-Allow-Origin": "*", // Libera para qualquer porta (ex: localhost:8081)
    "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "*", // Libera o envio do Authorization Bearer Token
  });

  // 2. O PULO DO GATO: Se for o "Voo de Reconhecimento" (OPTIONS), aprova na hora!
  if (getMethod(event) === 'OPTIONS') {
    event.node.res.statusCode = 204; // 204 significa "Sucesso, sem conteúdo"
    event.node.res.statusMessage = "No Content.";
    return 'OK'; // O Nuxt encerra a chamada aqui e o navegador fica feliz
  }
});