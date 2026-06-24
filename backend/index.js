require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const path      = require('path');
const routes    = require('./routes');

const app  = express();
const PORT = process.env.PORT || 4000;

// Seguridad
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 15,
  message: { error: 'Demasiados intentos, espera 15 min' } }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos — bloquear descarga directa sin referer
app.use('/uploads', (req, res, next) => {
  const ref    = req.headers['referer'] || '';
  const origin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  if (!ref.startsWith(origin)) return res.status(403).send('Acceso denegado');
  next();
}, express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.set('Cache-Control',       'no-store');
    res.set('Content-Disposition', 'inline');
    res.set('X-Frame-Options',     'DENY');
  },
}));

app.use('/api', routes);
app.get('/health', (_, res) => res.json({ ok: true }));

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno' });
});

app.listen(PORT, () => console.log(`🚀  API en http://localhost:${PORT}`));
