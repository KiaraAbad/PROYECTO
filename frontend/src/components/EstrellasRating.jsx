export default function EstrellasRating({ rating, setRating = null, readonly = true }) {
  const estrellas = [1, 2, 3, 4, 5];

  const handleKeyDown = (e, estrella) => {
    if (readonly || !setRating) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setRating(estrella);
    }
  };

  return (
    <div className="estrellas-container" role={readonly ? undefined : "radiogroup"} aria-label="Calificación en estrellas">
      {estrellas.map((estrella) => (
        <span
          key={estrella}
          className={`estrella ${estrella <= rating ? 'activa' : ''}`}
          role={readonly ? undefined : "button"}
          tabIndex={readonly ? undefined : 0}
          aria-label={`${estrella} de 5 estrellas`}
          onClick={() => !readonly && setRating && setRating(estrella)}
          onKeyDown={(e) => handleKeyDown(e, estrella)}
          style={{ cursor: readonly ? 'default' : 'pointer', fontSize: '1.2rem', color: estrella <= rating ? '#ffc107' : '#e4e5e9' }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
