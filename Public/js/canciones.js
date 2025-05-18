document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const eventoId = params.get('id');

    let cancionesGlobales = [];

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
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .then(canciones => {
            cancionesGlobales = canciones;
            console.log('Canciones cargadas desde API:', cancionesGlobales);

            const lista = document.getElementById('lista-canciones');
            if (!lista) {
                console.error('No se encontró el elemento lista-canciones');
                return;
            }

            lista.innerHTML = canciones.map(c => `
        <li class="item">
          <input type="checkbox" id="cancion${c.ID}" data-id="${c.ID}" class="cancion-checkbox">
          <label for="cancion${c.ID}">${c.Nombre}</label>
        </li>
      `).join('');

            const btnAgregar = document.getElementById('btn-agregar-canciones');
            btnAgregar.addEventListener('click', () => {
                const checkboxes = document.querySelectorAll('input.cancion-checkbox');
                let nuevasSeleccionadas = [];

                checkboxes.forEach(cb => {
                    if (cb.checked) {
                        const cancionCompleta = cancionesGlobales.find(c => c.ID === parseInt(cb.dataset.id));
                        if (cancionCompleta) {
                            nuevasSeleccionadas.push({
                                id: cancionCompleta.ID.toString(),
                                nombre: cancionCompleta.Nombre,
                                letra: cancionCompleta.Letra || '',
                                partitura: cancionCompleta.Partitura || ''
                            });
                        }
                    }
                });

                console.log('Canciones seleccionadas para agregar:', nuevasSeleccionadas);

                if (nuevasSeleccionadas.length === 0) {
                    alert('Selecciona al menos una canción');
                    return;
                }

                if (eventoId) {
                    // Agregar canciones al evento en backend
                    fetch(`/api/eventos/${eventoId}/agregar-canciones`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ canciones: nuevasSeleccionadas.map(c => c.id) })
                    })
                        .then(res => {
                            if (!res.ok) throw new Error('Error al agregar canciones.');
                            alert('Canciones agregadas al evento.');
                            window.location.href = `listaCancionesAgregadas.html?id=${eventoId}`;
                        })
                        .catch(error => {
                            console.error('Error al agregar canciones al evento:', error);
                            alert('No se pudo agregar las canciones.');
                        });
                } else {
                    // Guardar en localStorage
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
