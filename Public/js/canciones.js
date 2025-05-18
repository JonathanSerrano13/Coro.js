document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const eventoId = params.get('id'); // Leer el ID del evento

    const btnRegresar = document.getElementById('btn-regresar');
    if (btnRegresar) {
        if (eventoId) {
            btnRegresar.addEventListener('click', () => {
                window.location.href = `listaCancionesAgregadas.html?id=${eventoId}`;
            });
        } else {
            btnRegresar.addEventListener('click', () => {
                window.location.href = 'listaCanciones.html';
            });
        }
    }

    fetch('/api/canciones')
        .then(res => {
            console.log('Respuesta fetch:', res);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .then(canciones => {
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
            btnAgregar.addEventListener('click', async () => {
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

                if (eventoId) {
                    // Agregar canciones al evento específico
                    try {
                        const res = await fetch(`/api/eventos/${eventoId}/agregar-canciones`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ canciones: nuevasSeleccionadas.map(c => c.id) })
                        });

                        if (!res.ok) throw new Error('Error al agregar canciones.');

                        alert('Canciones agregadas al evento.');
                        window.location.href = `listaCancionesAgregadas.html?id=${eventoId}`;
                    } catch (error) {
                        console.error('Error al agregar canciones al evento:', error);
                        alert('No se pudo agregar las canciones.');
                    }
                } else {
                    // Flujo original: guardar en localStorage para crear eventos
                    const listaGuardada = JSON.parse(localStorage.getItem('listaCancionesSeleccionadas')) || [];
                    const combinada = [...listaGuardada];

                    nuevasSeleccionadas.forEach(nueva => {
                        if (!combinada.some(c => c.id === nueva.id)) {
                            combinada.push(nueva);
                        }
                    });

                    localStorage.setItem('listaCancionesSeleccionadas', JSON.stringify(combinada));
                    alert('Canciones agregadas.');
                    window.location.href = 'listaCanciones.html';
                }
            });
        })
        .catch(err => {
            console.error('Error cargando canciones:', err);
            document.getElementById('lista-canciones').innerHTML = '<li>Error al cargar canciones</li>';
        });

});
