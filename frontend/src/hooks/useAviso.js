import { useState, useRef } from "react";

export function useAviso(duracion = 7000) {
  const [aviso, setAviso] = useState(null);
  const timer = useRef(null);

  function cerrarAviso() {
    clearTimeout(timer.current);
    setAviso(null);
  }

  function avisar(tipo, mensaje, accion = null) {
    clearTimeout(timer.current);
    setAviso({ tipo, mensaje, accion });
    timer.current = setTimeout(() => setAviso(null), duracion);
  }

  return { aviso, avisar, cerrarAviso };
}
