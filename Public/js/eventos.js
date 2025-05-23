document.addEventListener('DOMContentLoaded', async () => {
  // Tu código original...
  
  // Función para cerrar sesión
  async function logout() {
    try {
      const res = await fetch('/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        window.location.href = '../index.html';
      } else {
        showAlert('Error al cerrar sesión', 'error');
      }
    } catch {
      showAlert('Error de red al cerrar sesión', 'error');
    }
  }

  // Asociar botón cerrar sesión (si existe)
  const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', logout);
  }

  // El resto de tu código original...
  const listaEventos = document.getElementById('lista-eventos');
  const buscarInput = document.getElementById('buscar-input');
  const crearEventoBtn = document.getElementById('crear-evento-btn');

  let rolUsuario = null;

  // Obtener rol de usuario
  async function obtenerRol() {
    try {
      const res = await fetch('/api/usuario');
      if (!res.ok) throw new Error('No autorizado o error en rol');
      const data = await res.json();
      return data.rol;
    } catch (error) {
      console.error('Error obteniendo rol:', error);
      return null;
    }
  }

  // Ocultar botones si rol es Integrante
  function ajustarUIsegunRol() {
    if (rolUsuario === 'Integrante') {
      if (crearEventoBtn) crearEventoBtn.style.display = 'none';
      document.querySelectorAll('.btn-borrar').forEach(btn => {
        btn.style.display = 'none';
      });
    }
  }

  async function cargarEventos() {
    try {
      const res = await fetch('/api/eventos');
      if (!res.ok) throw new Error('Error al cargar eventos');
      const eventos = await res.json();

      listaEventos.innerHTML = '';

      if (eventos.length === 0) {
        listaEventos.innerHTML = '<li>No hay eventos disponibles.</li>';
        ajustarUIsegunRol()
        return;
      }

      eventos.forEach(evento => {
        const li = document.createElement('li');
        li.classList.add('item');
        li.dataset.eventoId = evento.ID;

        li.innerHTML = `
          <span class="icono">♦</span>
          <div class="info-evento">
            <span class="nombre">${evento.Nombre}</span>
          </div>
          <div class="acciones">
            <button class="btn-ver-detalles" onclick="verDetalles(${evento.ID})">Detalles</button>
            <button class="btn-borrar"><i class="fi fi-rr-trash"></i></button>
          </div>
        `;

        li.querySelector('.btn-borrar').addEventListener('click', () => {
          showConfirm(`¿Eliminar evento "${evento.Nombre}"?`, async (confirmado) => {
            if (confirmado) {
              await borrarEvento(evento.ID);
            }
          });
        });

        listaEventos.appendChild(li);
      });

      ajustarUIsegunRol();

    } catch (error) {
      console.error('Error al cargar eventos:', error);
      showAlert('Error al cargar eventos.', 'error');
    }
  }

  async function borrarEvento(id) {
    try {
      const res = await fetch(`/api/eventos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showAlert('Evento eliminado con éxito', 'success');
        cargarEventos();
      } else {
        showAlert('Error al eliminar evento', 'error');
      }
    } catch {
      showAlert('Error al eliminar evento', 'error');
    }
  }

  window.verDetalles = function (id) {
    window.location.href = `verDetalles.html?id=${id}`;
  };

  buscarInput.addEventListener('input', () => {
    const filtro = buscarInput.value.toLowerCase();
    document.querySelectorAll('#lista-eventos .item').forEach(li => {
      const nombre = li.querySelector('.nombre').textContent.toLowerCase();
      li.style.display = nombre.includes(filtro) ? '' : 'none';
    });
  });

  rolUsuario = await obtenerRol();
  cargarEventos();

  // Funciones showAlert y showConfirm (igual que antes)

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
    }, 1000);
  }

  function showConfirm(message, callback) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.4)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1100';

    const box = document.createElement('div');
    box.style.backgroundColor = '#fff';
    box.style.padding = '20px 30px';
    box.style.borderRadius = '8px';
    box.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    box.style.maxWidth = '300px';
    box.style.textAlign = 'center';
    box.style.fontSize = '16px';
    box.textContent = message;

    const btnConfirm = document.createElement('button');
    btnConfirm.textContent = 'Sí';
    btnConfirm.style.margin = '10px';
    btnConfirm.style.padding = '8px 15px';
    btnConfirm.style.backgroundColor = '#4caf50';
    btnConfirm.style.color = '#fff';
    btnConfirm.style.border = 'none';
    btnConfirm.style.borderRadius = '5px';
    btnConfirm.style.cursor = 'pointer';

    const btnCancel = document.createElement('button');
    btnCancel.textContent = 'No';
    btnCancel.style.margin = '10px';
    btnCancel.style.padding = '8px 15px';
    btnCancel.style.backgroundColor = '#f44336';
    btnCancel.style.color = '#fff';
    btnCancel.style.border = 'none';
    btnCancel.style.borderRadius = '5px';
    btnCancel.style.cursor = 'pointer';

    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.marginTop = '15px';
    buttonsDiv.appendChild(btnConfirm);
    buttonsDiv.appendChild(btnCancel);

    box.appendChild(buttonsDiv);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    btnConfirm.addEventListener('click', () => {
      callback(true);
      document.body.removeChild(overlay);
    });

    btnCancel.addEventListener('click', () => {
      callback(false);
      document.body.removeChild(overlay);
    });
  }
});