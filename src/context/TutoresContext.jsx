import { useEffect, useState } from "react";
import datosTutores from "../data/tutores.json";
import { TutoresContext } from "./TutoresContext.js";

const STORAGE_KEY = "tutorias_tutores";

function cargarTutores() {
  try {
    const guardados = localStorage.getItem(STORAGE_KEY);

    if (guardados) {
      const datos = JSON.parse(guardados);

      if (Array.isArray(datos)) {
        return datos.map((tutor) => {
          const original = datosTutores.find((item) => item.id === tutor.id);
          const foto = tutor.fotoUrl || original?.fotoUrl || "";
          return {
            ...tutor,
            fotoUrl: foto,
            perfilTutor: {
              ...(tutor.perfilTutor || {}),
              fotoUrl: tutor.perfilTutor?.fotoUrl || original?.perfilTutor?.fotoUrl || foto,
            },
          };
        });
      }
    }
  } catch (error) {
    console.error("Error al cargar los tutores:", error);
  }

  return datosTutores;
}

export function TutoresProvider({ children }) {
  const [tutores, setTutores] = useState(cargarTutores);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tutores));
    } catch (error) {
      console.error("Error al guardar los tutores:", error);
    }
  }, [tutores]);

  function actualizarTutor(id, cambios) {
    setTutores((actuales) =>
      actuales.map((tutor) => {
        if (tutor.id !== id) return tutor;

        return {
          ...tutor,
          ...cambios,
          perfilTutor: {
            ...tutor.perfilTutor,
            ...(cambios.perfilTutor || {}),
          },
          disponibilidad:
            cambios.disponibilidad ?? tutor.disponibilidad,
        };
      })
    );
  }

  return (
    <TutoresContext.Provider
      value={{ tutores, actualizarTutor, cargando: false }}
    >
      {children}
    </TutoresContext.Provider>
  );
}
