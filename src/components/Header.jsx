
function Header() {
  return (
    <header>
      <h2 className="logo">Tutorías entre pares</h2>
      <nav>
        <a href="/">Inicio</a>
        <a href="#directorio">Directorio</a>
        <a href="#como-funciona">Cómo funciona</a>
        <a href="#Preguntas Frecuentes">Preguntas Frecuentes</a>
        <a href="/registro" className="boton-principal">
          Crear cuenta
        </a>
      </nav>
    </header>
  );
}

export default Header;