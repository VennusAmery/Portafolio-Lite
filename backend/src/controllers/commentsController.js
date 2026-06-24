const db = require('../config/db');

// GET /api/books/:id/comments
exports.list = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT id, author, body, created_at
      FROM comments
      WHERE book_id = ?
      ORDER BY created_at DESC
    `, [req.params.id]);
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Error al obtener comentarios' });
  }
};

// POST /api/books/:id/comments
exports.create = async (req, res) => {
  try {
    const { author, body } = req.body;
    if (!body?.trim()) return res.status(400).json({ error: 'Comentario vacío' });

    const [result] = await db.execute(
      'INSERT INTO comments (book_id, author, body) VALUES (?, ?, ?)',
      [req.params.id, (author?.trim() || 'Anónimo').substring(0, 80), body.trim()]
    );

    const [[row]] = await db.execute('SELECT * FROM comments WHERE id = ?', [result.insertId]);
    res.status(201).json(row);
  } catch {
    res.status(500).json({ error: 'Error al comentar' });
  }
};

// DELETE /api/comments/:id  (author only)
exports.remove = async (req, res) => {
  try {
    await db.execute('DELETE FROM comments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Eliminado' });
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
};
