const db     = require('../config/db');
const crypto = require('crypto');

// POST /api/books/:id/ratings
exports.rate = async (req, res) => {
  try {
    const stars  = parseInt(req.body.stars);
    const bookId = parseInt(req.params.id);

    if (!stars || stars < 1 || stars > 5)
      return res.status(400).json({ error: 'Estrellas deben ser 1–5' });

    const [[book]] = await db.execute('SELECT id FROM books WHERE id = ?', [bookId]);
    if (!book) return res.status(404).json({ error: 'Libro no encontrado' });

    // Hash de IP para limitar una calificación por visitante (sin guardar IP real)
    const ip     = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const ipHash = crypto.createHash('sha256').update(ip + bookId).digest('hex');

    // Si ya calificó desde esta IP, actualiza
    const [[existing]] = await db.execute(
      'SELECT id FROM ratings WHERE book_id = ? AND ip_hash = ?', [bookId, ipHash]
    );
    if (existing) {
      await db.execute('UPDATE ratings SET stars = ? WHERE id = ?', [stars, existing.id]);
    } else {
      await db.execute(
        'INSERT INTO ratings (book_id, stars, ip_hash) VALUES (?, ?, ?)',
        [bookId, stars, ipHash]
      );
    }

    const [[stats]] = await db.execute(
      'SELECT avg_stars, total_ratings FROM v_book_ratings WHERE book_id = ?', [bookId]
    );
    res.json({ avg_stars: stats?.avg_stars ?? stars, total_ratings: stats?.total_ratings ?? 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al calificar' });
  }
};
