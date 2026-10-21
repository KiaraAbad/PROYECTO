import React from 'react';

export default function AspectosCalificacion({ aspectos, setAspectos, readonly = false }) {
  const handleChange = (aspecto, valor) => {
    if (readonly) return;
    setAspectos({
      ...aspectos,
      [aspecto]: Number(valor)
    });
  };

  return (
    <div className="aspectos-calificacion">
      <div className="aspecto-item">
        <label>Claridad en la explicación:</label>
        <input 
          type="number" min="1" max="5" 
          value={aspectos.claridad} 
          disabled={readonly}
          onChange={(e) => handleChange('claridad', e.target.value)} 
        />
      </div>

      <div className="aspecto-item">
        <label>Puntualidad:</label>
        <input 
          type="number" min="1" max="5" 
          value={aspectos.puntualidad} 
          disabled={readonly}
          onChange={(e) => handleChange('puntualidad', e.target.value)} 
        />
      </div>

      <div className="aspecto-item">
        <label>Dominio del tema:</label>
        <input 
          type="number" min="1" max="5" 
          value={aspectos.dominio} 
          disabled={readonly}
          onChange={(e) => handleChange('dominio', e.target.value)} 
        />
      </div>
    </div>
  );
}