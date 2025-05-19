const form = document.getElementById('registroForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = form.nombre.value.trim();
  const email = form.email.value.trim();
  const telefono = form.telefono.value.trim();
  const password = form.password.value.trim();
  const rol = form.rol.value;

  const res = await fetch('/api/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, telefono, password, rol }),
  });

  const data = await res.json();

  if (res.ok) {
    showAlert('Registro exitoso', 'success');
    // Puedes retrasar el redireccionamiento para que se vea el mensaje un momento
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 1500);
  } else {
    showAlert(data.message || 'Error en registro', 'error');
  }
});

const input = document.querySelector('input[type="number"]');

input.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'e' || event.key === '+' || event.key === '-') {
    event.preventDefault();
  }
});

function showAlert(message, type = 'info') {
  // Elimina alertas anteriores para evitar acumulación
  const existingAlert = document.querySelector('.custom-alert');
  if (existingAlert) existingAlert.remove();

  const alertDiv = document.createElement('div');
  alertDiv.textContent = message;
  alertDiv.className = `custom-alert ${type}`;

  // Inserta el alert al inicio del formulario
  form.prepend(alertDiv);

  // Autoelimina después de 3 segundos
  setTimeout(() => {
    alertDiv.remove();
  }, 3000);
}