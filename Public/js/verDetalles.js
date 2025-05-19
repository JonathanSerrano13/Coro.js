document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const eventoId = urlParams.get('id');

  const form = document.getElementById('detalles-evento-form');
  const nombreInput = document.getElementById('Nombre_Evento');
  const fechaInput = document.getElementById('fecha');
  const horaInput = document.getElementById('hora');
  const ubicacionInput = document.getElementById('Ubicacion');
  const descripcionInput = document.getElementById('Descripcion');

  if (!eventoId) {
    showAlert('ID del evento no especificado', 'error');
    setTimeout(() => {
      window.location.href = 'Eventos.html';
    }, 1500);
    return;
  }

  // Cargar datos del evento
  fetch(`/api/eventos/${eventoId}`)
    .then(res => {
      if (!res.ok) throw new Error('Error al obtener evento');
      return res.json();
    })
    .then(evento => {
      nombreInput.value = evento.Nombre;

      // Separar fecha y hora de FechaHora (que es datetime)
      const fechaHora = new Date(evento.FechaHora);
      fechaInput.value = fechaHora.toISOString().slice(0, 10); // yyyy-mm-dd
      horaInput.value = fechaHora.toTimeString().slice(0,5);   // HH:mm

      ubicacionInput.value = evento.Ubicacion || '';
      descripcionInput.value = evento.Descripcion || '';
    })
    .catch(() => {
      showAlert('No se pudo cargar el evento', 'error');
      setTimeout(() => {
        window.location.href = 'Eventos.html';
      }, 1500);
    });

  // Guardar cambios (submit del formulario)
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Combinar fecha y hora en datetime string
    const fechaHoraStr = `${fechaInput.value} ${horaInput.value}:00`;

    const data = {
      Nombre: nombreInput.value.trim(),
      FechaHora: fechaHoraStr,
      Ubicacion: ubicacionInput.value.trim(),
      Descripcion: descripcionInput.value.trim(),
    };

    fetch(`/api/eventos/${eventoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    .then(res => {
      if (!res.ok) throw new Error('Error al actualizar');
      return res.json();
    })
    .then(() => {
      showAlert('Evento actualizado correctamente', 'success');
      setTimeout(() => {
        window.location.href = 'Eventos.html';
      }, 1500);
    })
    .catch(() => {
      showAlert('Error al actualizar evento', 'error');
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const btnCanciones = document.getElementById('ver-canciones-btn');

  // Aquí define o pasa el ID del evento
  const eventoId = obtenerIdEvento(); // Reemplaza con la lógica para obtener el ID

  // Añadir evento de clic al botón
  btnCanciones.addEventListener('click', () => {
    if (eventoId) {
      // Redirige a listaCancionesAgregadas.html con el ID del evento como query parameter
      window.location.href = `listaCancionesAgregadas.html?id=${eventoId}`;
    } else {
      showAlert('No se pudo obtener el ID del evento.', 'error');
    }
  });

  // Ejemplo de función para obtener el ID del evento
  function obtenerIdEvento() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }
});

// Función showAlert para mensajes personalizados

function showAlert(message, type = 'info') {
  const existingAlert = document.querySelector('.custom-alert');
  if (existingAlert) existingAlert.remove();

  const alertDiv = document.createElement('div');
  alertDiv.textContent = message;
  alertDiv.className = `custom-alert ${type}`;

  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.remove();
  }, 3000);
}