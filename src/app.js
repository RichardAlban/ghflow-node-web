const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Contacto
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email y message son requeridos' });
  }
  // Simula persistencia y devuelve un id
  const id = Math.random().toString(36).slice(2, 10);
  res.status(201).json({ id, name, email, message });
});

module.exports = app;
