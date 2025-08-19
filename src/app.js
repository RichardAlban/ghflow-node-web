const express = require('express');
const path = require('path');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir estáticos desde /public
app.use(express.static(path.join(__dirname, '../public'))); // express.static, doc oficial. 

// Endpoint mínimo de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
