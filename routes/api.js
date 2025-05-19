const express = require('express');
const router = express.Router();
const db = require('../config/db');



// Ruta para login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Faltan datos' });
  }

  const query = 'SELECT * FROM integrante WHERE Email = ?';
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error en base de datos' });

    if (results.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const user = results[0];

    if (password === user.Contraseña) {
      // Guardar datos en sesión
      req.session.userId = user.ID;
      req.session.userRol = user.Rol;

      return res.json({ message: 'Login exitoso', user: { id: user.ID, nombre: user.Nombre, rol: user.Rol } });
    } else {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }
  });
});

//Ruta para registro
router.post('/registro', (req, res) => {
  const { nombre, email, telefono, password, rol } = req.body;

  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  // Verificar si ya existe el email
  const checkQuery = 'SELECT * FROM integrante WHERE Email = ?';
  db.query(checkQuery, [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error en base de datos' });

    if (results.length > 0) {
      return res.status(409).json({ message: 'El correo ya está registrado' });
    }

    // Insertar nuevo usuario
    const insertQuery = 'INSERT INTO integrante (Nombre, Email, Telefono, Contraseña, Rol) VALUES (?, ?, ?, ?, ?)';
    db.query(insertQuery, [nombre, email, telefono || null, password, rol], (err, result) => {
      if (err) return res.status(500).json({ message: 'Error al registrar usuario' });

      return res.status(201).json({ message: 'Usuario registrado con éxito', userId: result.insertId });
    });
  });
});


// Middleware para simular sesión (ajusta según tu sistema real)
function authMiddleware(req, res, next) {
  req.session = req.session || {};
  req.session.user = req.session.userId || { Rol: 'Integrante' }; // o 'Admin'

  console.log('Rol del usuario en sesión:', req.session.userRol);

  next();
}

router.use(authMiddleware);

// Endpoint para obtener el rol del usuario actual
router.get('/usuario', (req, res) => {
  if (!req.session.userId) {
    console.log('No autenticado');
    return res.status(401).json({ message: 'No autenticado' });
  }

  console.log('Rol solicitado:', req.session.userRol);
  res.json({ rol: req.session.userRol });
});

// Ruta para cerrar sesión
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Error al cerrar sesión' });
    }
    res.clearCookie('connect.sid'); // El nombre de la cookie por defecto de express-session
    res.json({ message: 'Sesión cerrada correctamente' });
  });
});

// Obtener lista de eventos (solo id y nombre)
router.get('/eventos', (req, res) => {
  const userRol = req.session.userRol;  // Aquí obtienes el rol del usuario desde la sesión

  const query = 'SELECT ID, Nombre FROM evento ORDER BY FechaHora DESC';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener eventos' });

    // Añadir propiedad "permisos" según el rol
    const eventosConPermisos = results.map(evento => ({
      ...evento,
      permisos: {
        puedeBorrar: userRol === 'Administrador',
        puedeEditar: userRol === 'Administrador'
      }
    }));

    res.json(eventosConPermisos);
  });
});

// Borrar evento por ID
router.delete('/eventos/:id', (req, res) => {
  const { id } = req.params;

  // Borrar relaciones en visualizacion (canciones relacionadas)
  const deleteVisualizacion = `
    DELETE v FROM visualizacion v
    INNER JOIN listacanciones l ON v.ListaCancionesID = l.ID
    WHERE l.EventoID = ?
  `;

  // Borrar lista de canciones asociada al evento
  const deleteListaCanciones = 'DELETE FROM listacanciones WHERE EventoID = ?';

  // Borrar evento
  const deleteEvento = 'DELETE FROM evento WHERE ID = ?';

  db.query(deleteVisualizacion, [id], (err) => {
    if (err) {
      console.error('Error al borrar visualización:', err);
      return res.status(500).json({ message: 'Error al borrar canciones relacionadas' });
    }

    db.query(deleteListaCanciones, [id], (err) => {
      if (err) {
        console.error('Error al borrar listaCanciones:', err);
        return res.status(500).json({ message: 'Error al borrar lista de canciones' });
      }

      db.query(deleteEvento, [id], (err, result) => {
        if (err) {
          console.error('Error al borrar evento:', err);
          return res.status(500).json({ message: 'Error al borrar evento' });
        }
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Evento no encontrado' });
        res.json({ message: 'Evento eliminado con éxito' });
      });
    });
  });
});


// Crear nuevo evento
router.post('/eventos', (req, res) => {
  const { Nombre, FechaHora, Ubicacion, Descripcion, Canciones } = req.body;

  if (!Nombre || !FechaHora || !Ubicacion) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  // Insertar evento
  const eventoQuery = `INSERT INTO evento (Nombre, FechaHora, Ubicacion, Descripcion) VALUES (?, ?, ?, ?)`;
  db.query(eventoQuery, [Nombre, FechaHora, Ubicacion, Descripcion], (err, result) => {
    if (err) {
      console.error('Error al insertar evento:', err);
      return res.status(500).json({ message: 'Error al crear el evento' });
    }

    const eventoId = result.insertId;

    // Crear lista de canciones para el evento
    const listaQuery = `INSERT INTO listacanciones (EventoID) VALUES (?)`;
    db.query(listaQuery, [eventoId], (err, result) => {
      if (err) {
        console.error('Error al insertar lista de canciones:', err);
        return res.status(500).json({ message: 'Evento creado, pero ocurrió un error al crear la lista de canciones' });
      }

      const listaId = result.insertId;

      // Insertar relaciones de canciones con la lista
      if (Array.isArray(Canciones) && Canciones.length > 0) {
        const values = Canciones.map(c => [c.id, listaId]);
        const visualizacionQuery = `INSERT INTO visualizacion (CancionID, ListaCancionesID) VALUES ?`;

        db.query(visualizacionQuery, [values], (err) => {
          if (err) {
            console.error('Error al insertar canciones en visualización:', err);
            return res.status(500).json({ message: 'Evento y lista creados, pero ocurrió un error al relacionar canciones' });
          }

          res.status(201).json({ message: 'Evento, lista y canciones creados con éxito', eventoId });
        });
      } else {
        // Si no hay canciones, solo confirmamos creación del evento y la lista
        res.status(201).json({ message: 'Evento y lista creados sin canciones relacionadas', eventoId });
      }
    });
  });
});

// Actualizar evento por ID
router.put('/eventos/:id', (req, res) => {
  const { id } = req.params;
  const { Nombre, FechaHora, Ubicacion, Descripcion } = req.body;

  if (!Nombre || !FechaHora || !Ubicacion) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  const query = 'UPDATE evento SET Nombre = ?, FechaHora = ?, Ubicacion = ?, Descripcion = ? WHERE ID = ?';
  db.query(query, [Nombre, FechaHora, Ubicacion, Descripcion, id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al actualizar evento' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Evento no encontrado' });
    res.json({ message: 'Evento actualizado' });
  });
});

//Renderizar canciones de la base de datos
router.get('/canciones', (req, res) => {
  const query = 'SELECT ID, Nombre, Partitura, Letra FROM canciones ORDER BY Nombre ASC';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener canciones' });
    res.json(results);
  });
});


// Obtener evento por ID
router.get('/eventos/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM evento WHERE ID = ?';
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener evento' });
    if (results.length === 0) return res.status(404).json({ message: 'Evento no encontrado' });
    res.json(results[0]);
  });
});

// OBTENER CANCIONES por ID
// Ejemplo: Obtener canciones asociadas a un evento
router.get('/eventos/:id/canciones', (req, res) => {
  const { id: eventoId } = req.params;

  // Ajuste de la consulta para obtener canciones relacionadas con el evento
  const query = `
    SELECT c.ID, c.Nombre, c.Partitura, c.Letra, v.ID AS visualizacionID
    FROM canciones c
    INNER JOIN visualizacion v ON c.ID = v.CancionID
    INNER JOIN listacanciones l ON v.ListaCancionesID = l.ID
    WHERE l.EventoID = ?
  `;

  db.query(query, [eventoId], (err, results) => {
    if (err) {
      console.error('Error al obtener canciones:', err);
      return res.status(500).json({ message: 'Error al obtener canciones' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No se encontraron canciones para este evento' });
    }

    res.json(results);
  });
});

// Agregar canciones a un evento específico
router.post('/eventos/:id/agregar-canciones', (req, res) => {
  const { id: eventoId } = req.params;
  const { canciones } = req.body; // Espera un arreglo de IDs

  if (!Array.isArray(canciones) || canciones.length === 0) {
    return res.status(400).json({ message: 'Se requiere un arreglo de canciones' });
  }

  // Primero obtener el ID de la lista de canciones asociada al evento
  const listaQuery = 'SELECT ID FROM listacanciones WHERE EventoID = ?';
  db.query(listaQuery, [eventoId], (err, results) => {
    if (err) {
      console.error('Error al obtener lista de canciones:', err);
      return res.status(500).json({ message: 'Error al obtener lista de canciones' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No existe lista de canciones para este evento' });
    }

    const listaId = results[0].ID;

    // Preparar valores para insertar en visualizacion (CancionID, ListaCancionesID)
    const values = canciones.map(cancionId => [cancionId, listaId]);

    // Insertar las nuevas relaciones en visualizacion
    const insertQuery = 'INSERT INTO visualizacion (CancionID, ListaCancionesID) VALUES ?';
    db.query(insertQuery, [values], (err) => {
      if (err) {
        console.error('Error al agregar canciones:', err);
        return res.status(500).json({ message: 'Error al agregar canciones al evento' });
      }

      res.json({ message: 'Canciones agregadas con éxito' });
    });
  });
});


// Borrar una relación específica en visualizacion
router.delete('/visualizacion/:id', (req, res) => {
  const { id } = req.params;
  const deleteQuery = 'DELETE FROM visualizacion WHERE ID = ?';

  db.query(deleteQuery, [id], (err, result) => {
    if (err) {
      console.error('Error al borrar la relación:', err);
      return res.status(500).json({ message: 'Error al borrar la relación' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Relación no encontrada' });
    }

    res.json({ message: 'Relación eliminada con éxito' });
  });
});

module.exports = router;