document.addEventListener('DOMContentLoaded', async () => {
    const listaCancionesAgregadas = document.getElementById('lista-canciones');

    // Obtener el ID del evento desde la URL
    const params = new URLSearchParams(window.location.search);
    const eventoId = params.get('id');

    // Botón agregar canciones
    const btnAgregarCanciones = document.getElementById('btn-agregar-canciones');
    if (btnAgregarCanciones) {
        btnAgregarCanciones.style.display = 'none'; // Oculto por defecto, se muestra solo si es Admin
    } else {
        console.error('No se encontró el botón para agregar canciones.');
    }

    if (!eventoId) {
        listaCancionesAgregadas.innerHTML = '<li>Error: No se encontró el ID del evento.</li>';
        return;
    }

    // Botón regresar
    const btnRegresar = document.getElementById('btn-regresar');
    if (btnRegresar) {
        btnRegresar.addEventListener('click', () => {
            window.location.href = `verDetalles.html?id=${eventoId}`;
        });
    }

    // Insertar HTML del modal letra/partitura y modal alertas
    const modalHtml = `
    <div id="modal-letra-partitura" class="modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.6); justify-content:center; align-items:center;">
      <div class="modal-content" style="background:#fff; padding:20px; border-radius:8px; max-width:400px; width:90%; position:relative;">
        <button id="modal-close" style="position:absolute; top:10px; right:10px; font-size:20px; border:none; background:none; cursor:pointer;">&times;</button>
        <h3 id="modal-cancion-nombre"></h3>
        <p><strong>Letra:</strong> <a id="link-letra" href="#" target="_blank" rel="noopener noreferrer">Ver letra</a></p>
        <p><strong>Partitura:</strong> <a id="link-partitura" href="#" target="_blank" rel="noopener noreferrer">Ver partitura</a></p>
      </div>
    </div>

    <div id="modal-alerta" class="modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.6); justify-content:center; align-items:center;">
      <div class="modal-content" style="background:#fff; padding:20px; border-radius:8px; max-width:320px; width:90%; position:relative; text-align:center;">
        <p id="mensaje-alerta" style="margin-bottom:20px;"></p>
        <button id="btn-confirmar" style="padding:8px 20px; margin-right:10px; border:none; background:#4caf50; color:#fff; border-radius:5px; cursor:pointer;">Si</button>
        <button id="btn-cancelar" style="padding:8px 20px; border:none; background:#f44336; color:#fff; border-radius:5px; cursor:pointer;">No</button>
      </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Variables modales
    const modal = document.getElementById('modal-letra-partitura');
    const modalNombre = document.getElementById('modal-cancion-nombre');
    const linkLetra = document.getElementById('link-letra');
    const linkPartitura = document.getElementById('link-partitura');
    const modalClose = document.getElementById('modal-close');

    const modalAlerta = document.getElementById('modal-alerta');
    const mensajeAlerta = document.getElementById('mensaje-alerta');
    const btnConfirmar = document.getElementById('btn-confirmar');
    const btnCancelar = document.getElementById('btn-cancelar');

    // Cerrar modal letra/partitura
    modalClose.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
        if (event.target === modalAlerta) {
            modalAlerta.style.display = 'none';
        }
    });

    // Función para obtener rol del usuario
    async function obtenerRolUsuario() {
        try {
            const res = await fetch('/api/usuario');
            if (!res.ok) throw new Error('No autenticado');
            const data = await res.json();
            return data.rol;
        } catch {
            return null;
        }
    }

    // Función para mostrar modal alerta confirmación personalizada
    function mostrarConfirmacion(mensaje) {
        return new Promise((resolve) => {
            mensajeAlerta.textContent = mensaje;
            modalAlerta.style.display = 'flex';

            function confirmar() {
                modalAlerta.style.display = 'none';
                cleanup();
                resolve(true);
            }

            function cancelar() {
                modalAlerta.style.display = 'none';
                cleanup();
                resolve(false);
            }

            function cleanup() {
                btnConfirmar.removeEventListener('click', confirmar);
                btnCancelar.removeEventListener('click', cancelar);
            }

            btnConfirmar.addEventListener('click', confirmar);
            btnCancelar.addEventListener('click', cancelar);
        });
    }

    // Mostrar modal letra/partitura
    function mostrarModal(cancion) {
        modalNombre.textContent = cancion.Nombre;

        if (cancion.Letra) {
            linkLetra.href = cancion.Letra;
            linkLetra.textContent = 'Ver letra';
            linkLetra.style.pointerEvents = 'auto';
            linkLetra.style.color = '';
        } else {
            linkLetra.href = '#';
            linkLetra.textContent = 'No disponible';
            linkLetra.style.pointerEvents = 'none';
            linkLetra.style.color = 'gray';
        }

        if (cancion.Partitura) {
            linkPartitura.href = cancion.Partitura;
            linkPartitura.textContent = 'Ver partitura';
            linkPartitura.style.pointerEvents = 'auto';
            linkPartitura.style.color = '';
        } else {
            linkPartitura.href = '#';
            linkPartitura.textContent = 'No disponible';
            linkPartitura.style.pointerEvents = 'none';
            linkPartitura.style.color = 'gray';
        }

        modal.style.display = 'flex';
    }

    // Mostrar error con modal alerta
    function mostrarError(mensaje) {
        mensajeAlerta.textContent = mensaje;
        btnConfirmar.style.display = 'none';
        btnCancelar.textContent = 'Cerrar';
        modalAlerta.style.display = 'flex';

        btnCancelar.onclick = () => {
            modalAlerta.style.display = 'none';
            btnConfirmar.style.display = 'inline-block';
            btnCancelar.textContent = 'Cancelar';
            btnCancelar.onclick = null;
        };
    }

    const rolUsuario = await obtenerRolUsuario();

    // Mostrar botón agregar canciones solo si es Admin
    if (rolUsuario === 'Administrador' && btnAgregarCanciones) {
        btnAgregarCanciones.style.display = 'inline-block';
    }

    // Cargar canciones del evento
    async function cargarCanciones() {
        try {
            const res = await fetch(`/api/eventos/${eventoId}/canciones`);
            const canciones = await res.json();

            listaCancionesAgregadas.innerHTML = '';

            if (canciones.length === 0) {
                listaCancionesAgregadas.innerHTML = '<li>No hay canciones asociadas a este evento.</li>';
                return;
            }

            canciones.forEach(cancion => {
                const li = document.createElement('li');
                li.classList.add('item');

                // Solo mostrar botón borrar si es Admin
                const botonBorrarHTML = rolUsuario === 'Administrador'
                    ? `<button class="btn-borrar"><i class="fi fi-rr-trash"></i></button>`
                    : '';

                li.innerHTML = `
                    <span class="icono">♦</span>
                    <div class="info-evento">
                        <label>${cancion.Nombre}</label>
                    </div>
                    <div class="acciones">
                        <button class="btn-ver-letra-partitura"><i class="fi fi-rr-overview"></i></button>
                        ${botonBorrarHTML}
                    </div>
                `;

                // Evento para borrar canción con confirmación modal (solo si admin)
                if (rolUsuario === 'Administrador' && li.querySelector('.btn-borrar')) {
                    li.querySelector('.btn-borrar').addEventListener('click', async () => {
                        const confirmDelete = await mostrarConfirmacion(`¿Eliminar canción "${cancion.Nombre}"?`);
                        if (confirmDelete) {
                            borrarRelacion(cancion.visualizacionID);
                        }
                    });
                }

                // Evento para mostrar modal con letra/partitura (todos pueden)
                li.querySelector('.btn-ver-letra-partitura').addEventListener('click', () => {
                    mostrarModal(cancion);
                });

                listaCancionesAgregadas.appendChild(li);
            });
        } catch (error) {
            console.error('Error al cargar canciones:', error);
            mostrarError('Error al cargar canciones.');
        }
    }

    // Borrar relación en visualizacion
    async function borrarRelacion(visualizacionID) {
        try {
            const res = await fetch(`/api/visualizacion/${visualizacionID}`, { method: 'DELETE' });
            if (res.ok) {
                cargarCanciones();
            } else {
                mostrarError('Error al eliminar la relación.');
            }
        } catch (error) {
            mostrarError('Error al eliminar la relación.');
        }
    }

    cargarCanciones();
});