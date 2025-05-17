document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/canciones')
        .then(res => {
            console.log('Respuesta fetch:', res);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .then(canciones => {
            console.log('Canciones recibidas:', canciones);
            const lista = document.getElementById('lista-canciones');
            if (!lista) {
                console.error('No se encontró el elemento lista-canciones');
                return;
            }

            lista.innerHTML = canciones.map(c => `
        <li class="item">
          <input type="checkbox" id="cancion${c.ID}" data-id="${c.ID}" data-nombre="${c.Nombre}" class="cancion-checkbox">
          <label for="cancion${c.ID}">${c.Nombre}</label>
        </li>
      `).join('');

            const btnAgregar = document.getElementById('btn-agregar-canciones');
            btnAgregar.addEventListener('click', () => {
                const checkboxes = document.querySelectorAll('input.cancion-checkbox');
                let nuevasSeleccionadas = [];

                checkboxes.forEach(cb => {
                    if (cb.checked) {
                        nuevasSeleccionadas.push({
                            id: cb.dataset.id,
                            nombre: cb.dataset.nombre
                        });
                    }
                });

                if (nuevasSeleccionadas.length === 0) {
                    alert('Selecciona al menos una canción');
                    return;
                }

                // Leer lista previa desde localStorage
                const listaGuardada = JSON.parse(localStorage.getItem('listaCancionesSeleccionadas')) || [];

                // Combinar listas sin duplicados
                const combinada = [...listaGuardada];

                nuevasSeleccionadas.forEach(nueva => {
                    if (!combinada.some(c => c.id === nueva.id)) {
                        combinada.push(nueva);
                    }
                });

                // Guardar lista combinada
                localStorage.setItem('listaCancionesSeleccionadas', JSON.stringify(combinada));

                alert('Canciones agregadas');
                window.location.href = 'listaCanciones.html';
            });
        })
        .catch(err => {
            console.error('Error cargando canciones:', err);
            document.getElementById('lista-canciones').innerHTML = '<li>Error al cargar canciones</li>';
        });
});