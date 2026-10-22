
import { useState, useEffect } from "react";
import { useTutoresContext } from "../context/TutoresContext";

export function useTutores() {
  const { tutores, actualizarTutor } = useTutoresContext();
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCargando(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  return {
    tutores,
    cargando,
    actualizarTutor,
  };
}
