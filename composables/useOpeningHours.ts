export const useOpeningHours = () => {
  const isOpen = (schedules: any[]) => {
    if (!schedules || schedules.length === 0) return true; // Fallback

    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (Dom) a 6 (Sáb)
    const currentTime = now.getHours() * 100 + now.getMinutes(); // Ex: 14:30 -> 1430

    const today = schedules.find(s => s.dayOfWeek === dayOfWeek);

    if (!today || today.closed) return false;

    // Converte "08:00" para 800 para comparação numérica
    const open = parseInt(today.openTime.replace(':', ''));
    const close = parseInt(today.closeTime.replace(':', ''));

    return currentTime >= open && currentTime <= close;
  };

  const getTodayStatus = (schedules: any[]) => {
    const day = new Date().getDay();
    const today = schedules.find(s => s.dayOfWeek === day);
    if (!today || today.closed) return 'Fechado hoje';
    return `Aberto das ${today.openTime} às ${today.closeTime}`;
  };

  return { isOpen, getTodayStatus };
};