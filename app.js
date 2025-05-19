const express = require('express');
const session = require('express-session');  // <-- importar express-session
const app = express();
const apiRoutes = require('./routes/api');
const path = require('path');

app.use(express.static(path.join(__dirname, 'Public')));

app.use(express.json()); // para recibir JSON
app.use(express.urlencoded({ extended: true })); // para recibir datos de formularios

// Configurar sesión
app.use(session({
  secret: '1234', // cámbialo por algo más seguro y secreto
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // si usas HTTPS pon true, si no déjalo false
    maxAge: 1000 * 60 * 60 * 24 // duración de la cookie (aquí 1 día)
  }
}));

app.use('/api', apiRoutes);

// Puerto
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
  console.log(`Servidor iniciado en puerto ${PORT}`);
});