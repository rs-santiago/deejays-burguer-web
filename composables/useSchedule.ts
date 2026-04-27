// composables/useSchedule.ts
export const useSchedule = () => {
  const isCategoryOpen = (activeTime: any) => {
    // Se não houver restrição de horário, está sempre aberto
    if (!activeTime || !Array.isArray(activeTime) || activeTime.length === 0) {
      return true;
    }

    const now = new Date();
    const currentDay = now.getDay(); // 0 (Domingo) a 6 (Sábado)
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Tempo atual em minutos

    // Busca se o dia atual está configurado no JSON
    const todaySchedule = activeTime.find((item: any) => item.day === currentDay);

    if (!todaySchedule) return false;

    // Converte "HH:MM" de abertura e fechamento para minutos totais
    const [openH, openM] = todaySchedule.open.split(':').map(Number);
    const [closeH, closeM] = todaySchedule.close.split(':').map(Number);

    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    // Lógica para horários que viram a noite (ex: abre 18:00 e fecha 02:00)
    if (closeMinutes < openMinutes) {
      return currentTime >= openMinutes || currentTime <= closeMinutes;
    }

    return currentTime >= openMinutes && currentTime <= closeMinutes;
  };

  return { isCategoryOpen };
};