document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-crear-evento');
    let eventoCreado = false;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('nombre_evento').value.trim();
        const fecha = document.getElementById('fecha').value;
        const hora = document.getElementById('hora').value;
        const ubicacion = document.getElementById('ubicacion').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();

        if (!nombre || !fecha || !hora || !ubicacion) {
            showAlert('Por favor, completa todos los campos obligatorios', 'error');
            return;
        }

        const fechaHora = `${fecha} ${hora}:00`;

        let listaCanciones = [];
        const cancionesJSON = localStorage.getItem('listaCancionesSeleccionadas');
        if (cancionesJSON) {
            try {
                listaCanciones = JSON.parse(cancionesJSON);
            } catch (error) {
                console.error('Error al parsear lista de canciones:', error);
            }
        }

        const data = {
            Nombre: nombre,
            FechaHora: fechaHora,
            Ubicacion: ubicacion,
            Descripcion: descripcion || null,
            Canciones: listaCanciones
        };

        try {
            const res = await fetch('/api/eventos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                showAlert('Evento creado con éxito', 'success');
                eventoCreado = true;
                localStorage.removeItem('listaCancionesSeleccionadas');

                setTimeout(() => {
                    window.location.href = 'Eventos.html';
                }, 1000);
            } else {
                const errorData = await res.json();
                showAlert('Error al crear evento: ' + (errorData.message || res.statusText), 'error');
            }
        } catch (error) {
            showAlert('Error en la conexión al servidor', 'error');
            console.error(error);
        }
    });

    window.addEventListener('beforeunload', (e) => {
        if (!eventoCreado) {
            localStorage.removeItem('listaCancionesSeleccionadas');
        }
    });

    const fechaInput = document.getElementById('fecha');
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    const fechaMin = `${anio}-${mes}-${dia}`;
    fechaInput.min = fechaMin;
});

// Añade la función showAlert aquí o impórtala si la tienes en otro archivo
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