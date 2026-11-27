// Funcion para normalizar las busquedas

export function normalizar(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export const normalizarTexto = normalizar;


