document.addEventListener('DOMContentLoaded', async () => {
  const listaCanciones = document.getElementById('lista-canciones');

  // Obtener el ID del evento desde la URL
  const params = new URLSearchParams(window.location.search);
  const eventoId = params.get('id');

  if (!eventoId) {
    listaCanciones.innerHTML = '<li>Error: No se encontró el ID del evento.</li>';
    return;
  }

  // Cargar canciones del evento
  async function cargarCanciones() {
    try {
      const res = await fetch(`/api/eventos/${eventoId}/canciones`);
      const canciones = await res.json();

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
            <button class="btn-borrar"><i class="fi fi-rr-trash"></i></button>
          </div>
        `;

        // Evento para borrar canción
        li.querySelector('.btn-borrar').addEventListener('click', () => {
          if (confirm(`¿Eliminar canción "${cancion.nombre}"?`)) {
            borrarCancion(cancion.ID);
          }
        });

        listaCanciones.appendChild(li);
      });
    } catch (error) {
      console.error('Error al cargar canciones:', error);
      listaCanciones.innerHTML = '<li>Error al cargar canciones.</li>';
    }
  }

  // Borrar una canción
  async function borrarCancion(cancionId) {
    try {
      const res = await fetch(`/api/canciones/${cancionId}`, { method: 'DELETE' });
      if (res.ok) {
        cargarCanciones(); // Recargar la lista después de borrar
      } else {
        alert('Error al eliminar canción.');
      }
    } catch (error) {
      alert('Error al eliminar canción.');
    }
  }

  // Cargar canciones al inicio
  cargarCanciones();
});