document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            showAlert('Iniciaste sesión', 'success');

            // Guardar datos de usuario en localStorage
            localStorage.setItem('user', JSON.stringify(data.user));

            // Guardar rol en sessionStorage para control de UI
            sessionStorage.setItem('userRole', data.user.rol || 'integrante');

            setTimeout(() => {
                window.location.href = '/View/Eventos.html';
            }, 1000);
        } else {
            showAlert(data.message || 'Error al iniciar sesión. Por favor, inténtalo de nuevo.', 'error');
        }
    } catch (error) {
        showAlert('Error al conectar con el servidor. Por favor, verifica tu conexión a internet.', 'error');
    }
});


// Función showAlert sin cambios
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