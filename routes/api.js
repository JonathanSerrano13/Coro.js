const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Ruta POST para login
router.post("/login", (req, res) => {
  const { nombre, password } = req.body;
  if (!nombre || !password) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  const query = "SELECT * FROM integrante WHERE Nombre = ? AND Contraseña = ?";
  db.execute(query, [nombre, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error en la base de datos" });
    }

    if (results.length > 0) {
      const user = results[0];
      return res.json({
        success: true,
        message: "Inicio de sesión correcto",
        user: {
          id: user.ID,
          nombre: user.Nombre,
          rol: user.Rol,
          email: user.Email,
          telefono: user.Telefono,
        },
      });
    } else {
      return res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
    }
  });
});

// Ruta POST para registro
router.post("/registro", (req, res) => {
  const { nombre, email, telefono, password, rol } = req.body;

  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ message: "Faltan datos obligatorios" });
  }

  const checkQuery = "SELECT * FROM integrante WHERE Nombre = ? OR Email = ?";
  db.execute(checkQuery, [nombre, email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error en la base de datos" });
    }

    if (results.length > 0) {
      return res.status(409).json({ success: false, message: "El usuario o email ya existe" });
    }

    const insertQuery = "INSERT INTO integrante (Nombre, Email, Telefono, Contraseña, Rol) VALUES (?, ?, ?, ?, ?)";
    db.execute(insertQuery, [nombre, email, telefono || null, password, rol], (err2, result) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ message: "Error al insertar usuario" });
      }

      return res.json({ success: true, message: "Registro exitoso" });
    });
  });
});

module.exports = router;
