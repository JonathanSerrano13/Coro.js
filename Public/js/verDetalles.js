document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const eventoId = urlParams.get('id');

  const form = document.getElementById('detalles-evento-form');
  const nombreInput = document.getElementById('Nombre_Evento');
  const fechaInput = document.getElementById('fecha');
  const horaInput = document.getElementById('hora');
  const ubicacionInput = document.getElementById('Ubicacion');
  const descripcionInput = document.getElementById('Descripcion');
  const btnGuardar = document.getElementById('guardar-btn');
  const btnCanciones = document.getElementById('ver-canciones-btn');

  if (!eventoId) {
    showAlert('ID del evento no especificado', 'error');
    setTimeout(() => {
      window.location.href = 'Eventos.html';
    }, 1500);
    return;
  }

  // Primero obtenemos el rol del usuario desde backend
  fetch('/api/usuario')
    .then(res => {
      if (!res.ok) throw new Error('No autorizado');
      return res.json();
    })
    .then(data => {
      const userRole = data.rol.toLowerCase(); // 'administrador' o 'integrante'

      // Configura permisos según el rol
      configurarPermisos(userRole);

      // Carga datos del evento
      return fetch(`/api/eventos/${eventoId}`);
    })
    .then(res => {
      if (!res.ok) throw new Error('Error al obtener evento');
      return res.json();
    })
    .then(evento => {
      nombreInput.value = evento.Nombre;
      const fechaHora = new Date(evento.FechaHora);
      fechaInput.value = fechaHora.toISOString().slice(0, 10);
      horaInput.value = fechaHora.toTimeString().slice(0, 5);
      ubicacionInput.value = evento.Ubicacion || '';
      descripcionInput.value = evento.Descripcion || '';
    })
    .catch(err => {
      showAlert(err.message || 'Error al cargar datos', 'error');
      setTimeout(() => {
        window.location.href = 'Eventos.html';
      }, 1500);
    });

  function configurarPermisos(userRole) {
    if (userRole === 'integrante') {
      nombreInput.disabled = true;
      fechaInput.disabled = true;
      horaInput.disabled = true;
      ubicacionInput.disabled = true;
      descripcionInput.disabled = true;
      btnGuardar.style.display = 'none';
    } else if (userRole === 'administrador') {
      nombreInput.disabled = false;
      fechaInput.disabled = false;
      horaInput.disabled = false;
      ubicacionInput.disabled = false;
      descripcionInput.disabled = false;
      btnGuardar.style.display = 'inline-block';

      // Solo admin puede guardar cambios
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        guardarCambios();
      });
    }
  }

  function guardarCambios() {
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
  }

  btnCanciones.addEventListener('click', () => {
    window.location.href = `listaCancionesAgregadas.html?id=${eventoId}`;
  });

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
});