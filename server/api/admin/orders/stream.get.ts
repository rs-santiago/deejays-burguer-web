// server/api/admin/orders/stream.get.ts
export default defineEventHandler(async (event) => {
  const { brandId } = getQuery(event)

  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache')
  setHeader(event, 'Connection', 'keep-alive')

  // Função para enviar dados ao cliente
  const send = (data: any) => {
    event.node.res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  // Aqui você pode integrar com um EventEmitter global ou Redis Pub/Sub
  // Por enquanto, vamos simular a escuta de novos pedidos
  const interval = setInterval(() => {
    // Check database or cache for new orders for this brandId
  }, 5000)

  event.node.req.on('close', () => {
    clearInterval(interval)
  })

  // Mantém a conexão aberta
  return new Promise(() => {})
})