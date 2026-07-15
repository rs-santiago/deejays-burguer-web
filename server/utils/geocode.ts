/**
 * Converte um endereço em coordenadas usando uma API de Geocoding.
 * ATENÇÃO: Requer uma chave de API do Google Maps ou outro serviço.
 * @param address O endereço em formato de string.
 * @returns Um objeto com { lat, lng } ou null se não for encontrado.
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  // IMPORTANTE: Guarde sua chave de API no .env!
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('A chave de API do Google Maps não foi configurada no .env');
    // Lança um erro para que a operação que depende disso seja interrompida.
    throw new Error('A chave de API do Google Maps não está configurada.');
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;

  try {
    const response = await $fetch(url) as any;
    if (response.status === 'OK' && response.results.length > 0) {
      return response.results[0].geometry.location; // { lat, lng }
    }
    return null;
  } catch (error) {
    console.error('Erro ao geocodificar endereço:', error);
    return null;
  }
}