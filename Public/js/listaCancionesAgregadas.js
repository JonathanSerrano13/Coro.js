document.addEventListener('DOMContentLoaded', async () => {
    const listaCanciones = document.getElementById('lista-canciones');

    // Obtener el ID del evento desde la URL
    const params = new URLSearchParams(window.location.search);
    const eventoId = params.get('id');

    // Configuración al botón de agregar canciones
    const btnAgregarCanciones = document.getElementById('btn-agregar-canciones');
    if (btnAgregarCanciones) {
        btnAgregarCanciones.addEventListener('click', () => {
            window.location.href = `Canciones.html?id=${eventoId}`;
        });
    } else {
        console.error('No se encontró el botón para agregar canciones.');
    }

    if (!eventoId) {
        listaCanciones.innerHTML = '<li>Error: No se encontró el ID del evento.</li>';
        return;
    }

    // Actualizar el botón de regreso
    const btnRegresar = document.getElementById('btn-regresar');
    if (btnRegresar) {
        btnRegresar.addEventListener('click', () => {
            window.location.href = `verDetalles.html?id=${eventoId}`;
        });
    }

    // Insertar HTML del modal en body
    const modalHtml = `
    <div id="modal-letra-partitura" class="modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.6); justify-content:center; align-items:center;">
      <div class="modal-content" style="background:#fff; padding:20px; border-radius:8px; max-width:400px; width:90%; position:relative;">
        <button id="modal-close" style="position:absolute; top:10px; right:10px; font-size:20px; border:none; background:none; cursor:pointer;">&times;</button>
        <h3 id="modal-cancion-nombre"></h3>
        <p><strong>Letra:</strong> <a id="link-letra" href="#" target="_blank" rel="noopener noreferrer">Ver letra</a></p>
        <p><strong>Partitura:</strong> <a id="link-partitura" href="#" target="_blank" rel="noopener noreferrer">Ver partitura</a></p>
      </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.getElementById('modal-letra-partitura');
    const modalNombre = document.getElementById('modal-cancion-nombre');
    const linkLetra = document.getElementById('link-letra');
    const linkPartitura = document.getElementById('link-partitura');
    const modalClose = document.getElementById('modal-close');

    modalClose.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Cargar canciones del evento
    async function cargarCanciones() {
        try {
            const res = await fetch(`/api/eventos/${eventoId}/canciones`);
            const canciones = await res.json();
            console.log(canciones);

            // Limpiar la lista
            listaCanciones.innerHTML = '';

            if (canciones.length === 0) {
                listaCanciones.innerHTML = '<li>No hay canciones asociadas a este evento.</li>';
                return;
            }

            // Renderizar canciones
            canciones.forEach(cancion => {
                const li = document.createElement('li');
                li.classList.add('item');
                li.innerHTML = `
                    <span class="icono">♦</span>
                    <div class="info-evento">
                        <label>${cancion.Nombre}</label>
                    </div>
                    <div class="acciones">
                        <button class="btn-ver-letra-partitura">📄</button>
                        <button class="btn-borrar"><i class="fi fi-rr-trash"></i></button>
                    </div>
                `;

                // Evento para borrar canción
                li.querySelector('.btn-borrar').addEventListener('click', () => {
                    if (confirm(`¿Eliminar canción "${cancion.Nombre}"?`)) {
                        borrarRelacion(cancion.visualizacionID); // Usa el ID de la relación
                    }
                });

                // Evento para mostrar modal con links
                li.querySelector('.btn-ver-letra-partitura').addEventListener('click', () => {
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
                });

                listaCanciones.appendChild(li);
            });
        } catch (error) {
            console.error('Error al cargar canciones:', error);
            listaCanciones.innerHTML = '<li>Error al cargar canciones.</li>';
        }
    }

    // Borrar la relación específica en visualizacion
    async function borrarRelacion(visualizacionID) {
        try {
            const res = await fetch(`/api/visualizacion/${visualizacionID}`, { method: 'DELETE' });
            if (res.ok) {
                cargarCanciones(); // Recargar la lista después de borrar
            } else {
                alert('Error al eliminar la relación.');
            }
        } catch (error) {
            alert('Error al eliminar la relación.');
        }
    }

    // Cargar canciones al inicio
    cargarCanciones();
});