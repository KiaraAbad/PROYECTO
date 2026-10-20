import { useState, useEffect } from "react";
import datosTutores from "../data/tutores.json";

export function useTutores() {
  const [tutores, setTutores] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTutores(datosTutores);
      setCargando(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return { tutores, cargando };
}