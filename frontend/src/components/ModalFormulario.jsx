export default function ModalFormulario({ titulo, descripcion, alCerrar, children, pie }) {
  return (
    <div className="fondo-modal" role="presentation" onMouseDown={(evento) => { if (evento.target === evento.currentTarget) alCerrar() }}>
      <section className="modal-formulario" role="dialog" aria-modal="true" aria-labelledby="titulo-modal">
        <header className="modal-encabezado">
          <div><h2 id="titulo-modal">{titulo}</h2>{descripcion && <p>{descripcion}</p>}</div>
          <button className="boton-icono" type="button" onClick={alCerrar} aria-label="Cerrar ventana">×</button>
        </header>
        <div className="modal-cuerpo">{children}</div>
        {pie && <footer className="modal-pie">{pie}</footer>}
      </section>
    </div>
  )
}
