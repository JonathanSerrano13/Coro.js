document.addEventListener('DOMContentLoaded', function () {
    // Manejo de búsqueda de canciones
    const searchInput = document.getElementById('busqueda');
    const listaCanciones = document.getElementById('lista-canciones');
    
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const query = this.value;
            fetch(`/canciones?ajax=1&search=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(canciones => {
                    listaCanciones.innerHTML = '';
                    canciones.forEach(cancion => {
                        const li = document.createElement('li');
                        li.classList.add('item');
                        li.innerHTML = `
                            <input type="checkbox" id="cancion-${cancion[0]}" value="${cancion[0]}" name="canciones">
                            <label >${cancion[1]}</label>
                        `;
                        listaCanciones.appendChild(li);
                    });
                })
                .catch(error => {
                    console.error('Error al buscar canciones:', error);
                    alert('Error al buscar canciones. Intenta nuevamente.');
                });
        });
    }

    // Manejo de agregar canciones seleccionadas
    // Cargar canciones desde backend (ejemplo: GET /api/canciones)
    async function cargarCanciones() {
      const res = await fetch('/api/canciones');
      const canciones = await res.json();
      const contenedor = document.getElementById('canciones-lista');
      contenedor.innerHTML = '';

      canciones.forEach(c => {
        const div = document.createElement('div');
        div.innerHTML = `
          <input type="checkbox" class="cancion-checkbox" value="${c.ID}" />
          <label>${c.Nombre} - ${c.Artista}</label>
        `;
        contenedor.appendChild(div);
      });
    }

    // Enviar canciones seleccionadas al backend
    async function agregarCanciones() {
      const checkboxes = document.querySelectorAll('.cancion-checkbox:checked');
      const ids = Array.from(checkboxes).map(cb => cb.value);

      if (ids.length === 0) {
        alert('Selecciona al menos una canción');
        return;
      }

      const res = await fetch('/api/agregarCanciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canciones: ids })
      });

      const data = await res.json();
      alert(data.message);

      if (res.ok) {
        // Opcional: redirigir o limpiar selección
        checkboxes.forEach(cb => cb.checked = false);
      }
    }

    document.getElementById('btnAgregar').addEventListener('click', agregarCanciones);

    cargarCanciones();
});
