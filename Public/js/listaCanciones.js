document.addEventListener('DOMContentLoaded', () => {
  const listaUl = document.getElementById('lista-canciones');

  let lista = JSON.parse(localStorage.getItem('listaCancionesSeleccionadas')) || [];

  if (!document.getElementById('modal-letra-partitura')) {
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
  }

  const modal = document.getElementById('modal-letra-partitura');
  const modalNombre = document.getElementById('modal-cancion-nombre');
  const linkLetra = document.getElementById('link-letra');
  const linkPartitura = document.getElementById('link-partitura');
  const modalClose = document.getElementById('modal-close');

  modalClose.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });

  function mostrarModal(cancion) {
    modalNombre.textContent = cancion.nombre || 'Canción';

    if (cancion.letra) {
      linkLetra.href = cancion.letra;
      linkLetra.textContent = 'Ver letra';
      linkLetra.style.pointerEvents = 'auto';
      linkLetra.style.color = '';
    } else {
      linkLetra.href = '#';
      linkLetra.textContent = 'No disponible';
      linkLetra.style.pointerEvents = 'none';
      linkLetra.style.color = 'gray';
    }

    if (cancion.partitura) {
      linkPartitura.href = cancion.partitura;
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
  }

  // NUEVA función para mostrar confirmación personalizada
  function showConfirm(message, callback) {
    // Crear overlay
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

    // Crear caja de confirmación
    const box = document.createElement('div');
    box.style.backgroundColor = '#fff';
    box.style.padding = '20px 30px';
    box.style.borderRadius = '8px';
    box.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    box.style.maxWidth = '320px';
    box.style.textAlign = 'center';
    box.style.fontSize = '16px';
    box.textContent = message;

    // Botones
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

    // Contenedor botones
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

  function renderizarLista() {
    listaUl.innerHTML = '';

    if (lista.length === 0) {
      listaUl.innerHTML = '<li>No hay canciones seleccionadas.</li>';
      return;
    }

    lista.forEach(cancion => {
      const li = document.createElement('li');
      li.classList.add('item');
      li.innerHTML = `
        <span class="icono">♦</span>
        <div class="info-evento">
          <label>${cancion.nombre}</label>
        </div>
        <div class="acciones">
          <button class="btn-ver-letra-partitura"><i class="fi fi-rr-overview"></i></button>
          <button class="btn-borrar" data-id="${cancion.id}"><i class="fi fi-rr-trash"></i></button>
        </div>
      `;

      li.querySelector('.btn-ver-letra-partitura').addEventListener('click', () => {
        mostrarModal(cancion);
      });

      li.querySelector('.btn-borrar').addEventListener('click', () => {
        showConfirm(`¿Eliminar canción "${cancion.nombre}"?`, (confirmado) => {
          if (confirmado) {
            lista = lista.filter(c => c.id !== cancion.id);
            localStorage.setItem('listaCancionesSeleccionadas', JSON.stringify(lista));
            renderizarLista();
          }
        });
      });

      listaUl.appendChild(li);
    });
  }

  renderizarLista();
});