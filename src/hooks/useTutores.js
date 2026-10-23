import { useState, useEffect, useContext } from "react";
import { TutoresContext } from "../context/TutoresContext.js";

export function useTutoresContext() {
  const contexto = useContext(TutoresContext);
  if (!contexto) {
    throw new Error(
      "useTutoresContext debe utilizarse dentro de TutoresProvider"
    );
  }
  return contexto;
}

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
