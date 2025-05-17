document.addEventListener('DOMContentLoaded', () => {
  const listaUl = document.getElementById('lista-canciones');

  let lista = JSON.parse(localStorage.getItem('listaCancionesSeleccionadas')) || [];

  listaUl.innerHTML = ''; // limpiar

  lista.forEach(cancion => {
    const li = document.createElement('li');
    li.classList.add('item');
    li.innerHTML = `
      <span class="icono">♦</span>
      <div class="info-evento">
        <label>${cancion.nombre}</label>
      </div>
      <div class="acciones">
        <button class="btn-borrar" data-id="${cancion.id}"><i class="fi fi-rr-trash"></i></button>
      </div>
    `;

    listaUl.appendChild(li);
  });

  // Manejar eliminar canciones
  listaUl.addEventListener('click', e => {
    if(e.target.closest('.btn-borrar')) {
      const btn = e.target.closest('.btn-borrar');
      const id = btn.dataset.id;
      lista = lista.filter(c => c.id !== id);
      localStorage.setItem('listaCancionesSeleccionadas', JSON.stringify(lista));
      btn.closest('li').remove();
    }
  });
});