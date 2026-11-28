import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosClient from '../config/axiosClient'
import fotoInicio from '../assets/foto-consulta.png'
import { validarCorreo } from '../utilidades/validacionesFormulario.js'

function MarcaRecuperacion() {
  return (
    <div className="marca" aria-label="VITACARE">
      <span className="marca-icono" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" fill="currentColor" />
        </svg>
      </span>
      <span className="nombre-marca">VITACARE</span>
    </div>
  )
}

function IconoCorreo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4.5 7 7.5 6 7.5-6" />
    </svg>
  )
}

function IconoCodigo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 12h8M12 8v8" />
    </svg>
  )
}

function IconoCandado() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

export default function RecuperarContrasena() {
  const navigate = useNavigate()
  const [paso, establecerPaso] = useState(1)
  const [correo, establecerCorreo] = useState('')
  const [codigo, establecerCodigo] = useState('')
  const [nuevaContrasena, establecerNuevaContrasena] = useState('')
  const [confirmarContrasena, establecerConfirmarContrasena] = useState('')
  const [errorGeneral, establecerErrorGeneral] = useState('')
  const [mensajeExito, establecerMensajeExito] = useState('')
  const [enviando, establecerEnviando] = useState(false)

  async function gestionarSolicitarCodigo(event) {
    event.preventDefault()
    const error = validarCorreo(correo)
    establecerErrorGeneral(error)
    if (error) return

    establecerEnviando(true)
    establecerMensajeExito('')
    try {
      const { data } = await axiosClient.post('/autenticacion/recuperar-contrasena-sms', {
        email: correo.trim()
      })
      establecerMensajeExito(
        data?.mensaje || 'Te enviamos un código de verificación por SMS a tu teléfono registrado.'
      )
      establecerPaso(2)
    } catch (err) {
      establecerErrorGeneral(
        err.response
          ? err.response.data?.mensaje || err.response.data?.email || 'No se pudo enviar el código SMS. Intenta de nuevo.'
          : 'No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.'
      )
    } finally {
      establecerEnviando(false)
    }
  }

  async function gestionarRestablecer(event) {
    event.preventDefault()
    establecerErrorGeneral('')

    if (!codigo.trim() || codigo.trim().length < 4) {
      establecerErrorGeneral('Ingresa el código de verificación que recibiste por SMS.')
      return
    }
    if (!nuevaContrasena || nuevaContrasena.length < 6) {
      establecerErrorGeneral('La nueva contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (nuevaContrasena !== confirmarContrasena) {
      establecerErrorGeneral('Las contraseñas no coinciden.')
      return
    }

    establecerEnviando(true)
    try {
      await axiosClient.post('/autenticacion/restablecer-contrasena-sms', {
        email: correo.trim(),
        codigo: codigo.trim(),
        nuevaContrasena
      })
      navigate('/login', {
        state: { mensaje: 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.' }
      })
    } catch (err) {
      establecerErrorGeneral(
        err.response
          ? err.response.data?.mensaje || 'El código SMS es incorrecto o ha expirado.'
          : 'No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.'
      )
    } finally {
      establecerEnviando(false)
    }
  }

  return (
    <main className="pantalla-inicio">
      <aside
        className="visual-inicio"
        style={{ '--foto-inicio': `url("${fotoInicio}")` }}
        aria-label="Consulta médica"
      >
        <div className="contenido-visual-inicio">
          <MarcaRecuperacion />
          <div className="separador-visual" />
        </div>
      </aside>

      <section className="panel-inicio" aria-labelledby="recuperacion-title">
        <div className="tarjeta-inicio tarjeta-recuperacion">
          <div className="marca-movil"><MarcaRecuperacion /></div>
          <header className="encabezado-inicio">
            <h1 id="recuperacion-title">
              {paso === 1 ? '¿Olvidaste tu contraseña?' : 'Verifica tu código SMS'}
            </h1>
            <p>
              {paso === 1
                ? 'Te enviaremos un código de verificación por SMS al teléfono asociado a tu cuenta.'
                : `Ingresa el código enviado por SMS para ${correo} y crea tu nueva contraseña.`}
            </p>
          </header>

          {paso === 1 ? (
            <form className="formulario-inicio formulario-recuperacion" noValidate onSubmit={gestionarSolicitarCodigo}>
              <div className="campo-formulario">
                <label htmlFor="correo-recuperacion">Correo electrónico</label>
                <div className={`contenedor-entrada${errorGeneral ? ' tiene-error' : ''}`}>
                  <IconoCorreo />
                  <input
                    id="correo-recuperacion"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="correo@ejemplo.com"
                    value={correo}
                    aria-invalid={Boolean(errorGeneral)}
                    onChange={(event) => {
                      const valor = event.target.value
                      establecerCorreo(valor)
                      establecerErrorGeneral(
                        valor.trim() ? validarCorreo(valor) : errorGeneral ? 'Escribe tu correo electrónico.' : ''
                      )
                    }}
                  />
                </div>
                {errorGeneral && <p className="error-campo">{errorGeneral}</p>}
              </div>

              <button className="boton-iniciar" type="submit" disabled={enviando}>
                {enviando ? 'Enviando código…' : <>Enviar código SMS <span aria-hidden="true">→</span></>}
              </button>
              <Link className="enlace-regreso-recuperacion" to="/login">
                Volver al inicio de sesión
              </Link>
            </form>
          ) : (
            <form className="formulario-inicio formulario-recuperacion" noValidate onSubmit={gestionarRestablecer}>
              {mensajeExito && (
                <p className="mensaje-exito" style={{ color: '#0f766e', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                  {mensajeExito}
                </p>
              )}

              <div className="campo-formulario">
                <label htmlFor="codigo-sms">Código SMS (6 dígitos)</label>
                <div className="contenedor-entrada">
                  <IconoCodigo />
                  <input
                    id="codigo-sms"
                    name="codigo"
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    placeholder="123456"
                    value={codigo}
                    onChange={(event) => {
                      establecerCodigo(event.target.value)
                      if (errorGeneral) establecerErrorGeneral('')
                    }}
                  />
                </div>
              </div>

              <div className="campo-formulario">
                <label htmlFor="nueva-contrasena">Nueva contraseña</label>
                <div className="contenedor-entrada">
                  <IconoCandado />
                  <input
                    id="nueva-contrasena"
                    name="nuevaContrasena"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Mínimo 6 caracteres"
                    value={nuevaContrasena}
                    onChange={(event) => {
                      establecerNuevaContrasena(event.target.value)
                      if (errorGeneral) establecerErrorGeneral('')
                    }}
                  />
                </div>
              </div>

              <div className="campo-formulario">
                <label htmlFor="confirmar-contrasena">Confirmar nueva contraseña</label>
                <div className="contenedor-entrada">
                  <IconoCandado />
                  <input
                    id="confirmar-contrasena"
                    name="confirmarContrasena"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repite tu contraseña"
                    value={confirmarContrasena}
                    onChange={(event) => {
                      establecerConfirmarContrasena(event.target.value)
                      if (errorGeneral) establecerErrorGeneral('')
                    }}
                  />
                </div>
              </div>

              {errorGeneral && <p className="error-campo">{errorGeneral}</p>}

              <button className="boton-iniciar" type="submit" disabled={enviando}>
                {enviando ? 'Actualizando…' : <>Restablecer contraseña <span aria-hidden="true">→</span></>}
              </button>

              <button
                type="button"
                className="enlace-regreso-recuperacion"
                style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.5rem' }}
                disabled={enviando}
                onClick={() => {
                  establecerPaso(1)
                  establecerCodigo('')
                  establecerErrorGeneral('')
                  establecerMensajeExito('')
                }}
              >
                Usar otro correo o reenviar código
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}