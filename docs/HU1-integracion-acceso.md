# Conexión de cuenta y acceso con las sesiones

## Alcance

Esta conexión añade el acceso simulado que necesitan HU-4 y HU-5 para recibir el usuario y rol de HU-1. Es una demostración de frontend para la primera entrega, no un sistema de autenticación de producción. No hay servidor, validación real de correo ni envío de mensajes.

Incluye ingreso, salida de la cuenta, registro local de estudiante con nombres, apellidos, carrera y ciclo, validaciones, conservación del acceso y restricciones de navegación por usuario y rol. Se mantienen los IDs canónicos del grupo. Cambiar de rol conserva a la misma persona: no cambia de Sebastián a Joaquín.

No completa toda HU-1: quedan para su responsable la invitación del coordinador, edición de la cuenta, fotografía y contacto, cambio de contraseña y recuperación. La activación de tutor pertenece a HU-2; un registro nuevo solo recibe el rol de estudiante. Las valoraciones de HU-6 conservan su implementación del grupo y no se consideran integradas de extremo a extremo por esta conexión.

## Cuentas de demostración

En `/login`, abre **Cuentas de prueba**, pulsa la cuenta deseada y luego **Ingresar**.

| Persona | Correo ficticio de acceso | ID | Roles disponibles |
|---|---|---|---|
| Sebastián Rojas Mendoza | sebastian.rojas@aloe.ulima.edu.pe | u-003 | Tutor y estudiante |
| Joaquín Medina Talledo | joaquin.medina@aloe.ulima.edu.pe | u-101 | Estudiante |

La contraseña pública de ambas cuentas de ejemplo es `Tutorias2026!`. No corresponde a una cuenta real. Para probar un registro propio usa también datos y una contraseña ficticios.

Sebastián entra inicialmente como tutor y Joaquín como estudiante. Para ver las sesiones de otra persona hay que salir e ingresar en su cuenta. Joaquín no puede activar el botón Tutor. Si Sebastián cambia a estudiante, conserva el ID u-003; no debe ver las sesiones de Joaquín por ese cambio.

## Funcionamiento del código

- `AutenticacionProvider` comparte `usuario`, `usuarios`, `rol`, `ingresar`, `registrar`, `cambiarRol` y `salir`.
- `useAutenticacion()` permite consultar esos datos. El encabezado y HU-1 usan este hook.
- `SesionesProvider` consume esa identidad en lugar de iniciar automáticamente con u-003. Mantiene las operaciones de HU-4/HU-5 y comprueba quién participa en cada sesión.
- `RutaPrivada` envía a los visitantes al login. Las solicitudes, el resumen y el formulario de cierre requieren rol de tutor; las valoraciones privadas requieren estudiante. Los detalles y materiales comprueban además el ID del participante.
- `utils/autenticacion.js` reúne validaciones, almacenamiento y credenciales locales. Las cuentas nuevas guardan una huella PBKDF2 con sal aleatoria, no la contraseña en texto. Esto no convierte la demo en autenticación segura de servidor: el almacenamiento y las reglas del frontend pueden alterarse desde el navegador.

El ingreso regresa a la ruta privada solicitada cuando corresponde, o a la vista principal del rol. Un visitante sigue pudiendo consultar inicio, directorio y fichas públicas en modo lectura.

## Datos del navegador

- `tutorias.identidad.v1`: guarda únicamente el ID y rol activos. Sin **Recordarme** se usa `sessionStorage`; con esa opción se usa `localStorage`.
- `tutorias.cuentas.v1`: registros locales de estudiantes, con credenciales derivadas.
- `tutorias.sesiones.v2`: conserva la agenda, cierres, notas y materiales existentes. No se reinicia al ingresar, cambiar de rol ni salir.
- `tutorias.hu5.v1`: sigue siendo el respaldo anterior y no se borra.

Salir elimina la identidad de ambos almacenes, sin borrar las cuentas registradas ni las tutorías. Esta conservación es local a este navegador y dirección: `localhost` y `127.0.0.1` no comparten el mismo almacenamiento.

## Pruebas manuales

1. Sin ingresar, abre `/sesiones/resumen`: debe aparecer el login.
2. Prueba correo externo, campos vacíos y contraseña incorrecta: no deben iniciar el acceso.
3. Ingresa como Sebastián. Abre la agenda, un cierre permitido y el resumen; el encabezado debe mostrar al mismo tutor.
4. Guarda un cierre y recarga: debe conservar el resultado y las horas.
5. Cambia a estudiante: debe seguir siendo Sebastián, sin acceso al resumen de tutor.
6. Sal de la cuenta. Abrir una ruta privada debe volver a pedir ingreso.
7. Ingresa como Joaquín: consulta sus notas finales y material en lectura; no puede cerrar ni ver sesiones ajenas.
8. Registra un alumno ficticio. Comprueba las validaciones, ingresa con esa cuenta y confirma que empieza sin sesiones y solo con rol estudiante.
9. Prueba **Recordarme** y la recarga. Sal otra vez: el acceso no debe restaurarse por una identidad anterior.
10. Comprueba que salir no cambió los cierres ni las horas de Sebastián.

Las reglas puras están en `tests/hu1-autenticacion.test.mjs`. La comprobación conjunta es `node --test tests/*.test.mjs`, `npm run lint` y `npm run build`.
