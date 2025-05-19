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
          showAlert('Selecciona al menos una canción', 'error');
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
              showAlert('Canciones agregadas al evento.', 'success');
              setTimeout(() => {
                window.location.href = `listaCancionesAgregadas.html?id=${eventoId}`;
              }, 1000);
            })
            .catch(error => {
              console.error('Error al agregar canciones al evento:', error);
              showAlert('No se pudo agregar las canciones.', 'error');
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
          showAlert('Canciones agregadas.', 'success');
          setTimeout(() => {
            window.location.href = 'listaCanciones.html';
          }, 1000);
        }
      });
    })
    .catch(err => {
      console.error('Error cargando canciones:', err);
      document.getElementById('lista-canciones').innerHTML = '<li>Error al cargar canciones</li>';
    });
});

// Función showAlert para alertas tipo toast estilizadas
function showAlert(message, type) {
  const alertDiv = document.createElement('div');
  alertDiv.textContent = message;
  alertDiv.className = `alert alert-${type}`;

  document.body.appendChild(alertDiv);

  alertDiv.style.position = 'fixed';
  alertDiv.style.top = '20px';
  alertDiv.style.left = '50%';
  alertDiv.style.transform = 'translateX(-50%)';
  alertDiv.style.padding = '10px 20px';
  alertDiv.style.color = '#fff';
  alertDiv.style.backgroundColor = type === 'success' ? '#4caf50' : '#f44336';
  alertDiv.style.borderRadius = '5px';
  alertDiv.style.zIndex = '1000';
  alertDiv.style.boxShadow = '0px 4px 6px rgba(0,0,0,0.1)';
  alertDiv.style.fontSize = '16px';

  setTimeout(() => {
    alertDiv.remove();
  }, 2000);
}