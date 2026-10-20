export const FECHA_BASE = new Date(2026, 9 ,19);
export const DIA_MS = 24*3600*1000;
export const SEMANA_MS = 7*DIA_MS;

export const DIAS_ORDEN = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];

export function lunesDeSemana(fecha) {
    const lunes = new Date(fecha);
    lunes.setDate(fecha.getDate() - (fecha.getDay()+6)%7);
    return lunes;
}

export function rangoSemana(lunes) {
  const f = (d) => d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
  return `${f(lunes)} — ${f(new Date(lunes.getTime() + 5 * DIA_MS))}`;
}

export const DIA_CONTRATO = { 1: "lunes", 2: "martes", 3: "miercoles", 4: "jueves", 5: "viernes", 6: "sabado" };