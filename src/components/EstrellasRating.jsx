import React from 'react';

export default function EstrellasRating({ rating, setRating = null, readonly = true }) {
  const estrellas = [1, 2, 3, 4, 5];

  return (
    <div className="estrellas-container">
      {estrellas.map((estrella) => (
        <span
          key={estrella}
          className={`estrella ${estrella <= rating ? 'activa' : ''}`}
          onClick={() => !readonly && setRating && setRating(estrella)}
          style={{ cursor: readonly ? 'default' : 'pointer', fontSize: '1.2rem', color: estrella <= rating ? '#ffc107' : '#e4e5e9' }}
        >
          ★
        </span>
      ))}
    </div>
  );
}