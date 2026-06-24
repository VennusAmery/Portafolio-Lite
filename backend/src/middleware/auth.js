const jwt = require('jsonwebtoken');

const authorOnly = (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ error: 'No autorizado' });
  const token = header.startsWith('Bearer ') ? header.slice(7) : header;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'author') return res.status(403).json({ error: 'Solo el autor' });
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = { authorOnly };
