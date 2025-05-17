const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Ruta para login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Faltan datos' });
    }

    // Buscar usuario en tabla 'integrante' por Email
    const query = 'SELECT * FROM integrante WHERE Email = ?';
    db.query(query, [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en base de datos' });

        if (results.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const user = results[0];

        if (password === user.Contraseña) {
            return res.json({ message: 'Login exitoso', user: { id: user.ID, nombre: user.Nombre, rol: user.Rol } });
        } else {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }
    });
});


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



// Obtener lista de eventos (solo id y nombre)
router.get('/eventos', (req, res) => {
  const query = 'SELECT ID, Nombre FROM evento ORDER BY FechaHora DESC';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener eventos' });
    res.json(results);
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
    const listaQuery = `INSERT INTO listaanciones (EventoID) VALUES (?)`;
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
  const query = 'SELECT ID, Nombre FROM canciones ORDER BY Nombre ASC';
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
    SELECT c.ID, c.Nombre
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
module.exports = router;