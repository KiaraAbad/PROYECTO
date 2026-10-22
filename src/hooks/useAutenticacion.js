import { useContext } from 'react';
import { AutenticacionContext } from '../context/AutenticacionContext';

export function useAutenticacion() {
  const contexto = useContext(AutenticacionContext);
  if (!contexto) throw new Error('useAutenticacion necesita AutenticacionProvider.');
  return contexto;
}
