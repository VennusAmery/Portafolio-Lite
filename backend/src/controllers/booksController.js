const db   = require('../config/db');
const path = require('path');
const fs   = require('fs');

// GET /api/books
exports.list = async (req, res) => {
  try {
    const conditions = ['1=1'];
    const params     = [];

    if (req.query.search) {
      conditions.push('(b.title LIKE ? OR b.description LIKE ?)');
      params.push(`%${req.query.search}%`, `%${req.query.search}%`);
    }
    if (req.query.date_from) { conditions.push('b.published_at >= ?'); params.push(req.query.date_from); }
    if (req.query.date_to)   { conditions.push('b.published_at <= ?'); params.push(req.query.date_to); }

    const sorts = {
      title_asc:   'b.title ASC',
      title_desc:  'b.title DESC',
      date_asc:    'b.published_at ASC',
      date_desc:   'b.published_at DESC',
      rating_desc: 'avg_stars DESC',
    };
    const orderBy = sorts[req.query.sort] || 'b.created_at DESC';

    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(24, parseInt(req.query.limit) || 12);
    const offset = (page - 1) * limit;
    const where  = conditions.join(' AND ');

    // Usar db.query (no execute) + LIMIT/OFFSET como literales
    const [rows] = await db.query(
      `SELECT b.id, b.title, b.description, b.cover_url,
              b.published_at, b.view_count, b.created_at,
              COALESCE(v.avg_stars, 0)     AS avg_stars,
              COALESCE(v.total_ratings, 0) AS total_ratings
       FROM books b
       LEFT JOIN v_book_ratings v ON v.book_id = b.id
       WHERE ${where}
       ORDER BY ${orderBy}
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM books b WHERE ${where}`,
      params
    );

    res.json({ data: rows, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar libros' });
  }
};

// GET /api/books/:id
exports.getOne = async (req, res) => {
  try {
    const [[book]] = await db.query(
      `SELECT b.*, COALESCE(v.avg_stars,0) AS avg_stars, COALESCE(v.total_ratings,0) AS total_ratings
       FROM books b
       LEFT JOIN v_book_ratings v ON v.book_id = b.id
       WHERE b.id = ?`,
      [req.params.id]
    );
    if (!book) return res.status(404).json({ error: 'No encontrado' });
    await db.query('UPDATE books SET view_count = view_count + 1 WHERE id = ?', [book.id]);
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
};

// POST /api/books (author only)
exports.create = async (req, res) => {
  try {
    const { title, description, published_at } = req.body;
    const pdfFile   = req.files?.pdf?.[0];
    const coverFile = req.files?.cover?.[0];

    if (!title?.trim()) return res.status(400).json({ error: 'Título requerido' });
    if (!pdfFile)       return res.status(400).json({ error: 'PDF requerido' });

    const [result] = await db.query(
      `INSERT INTO books (title, description, cover_url, pdf_path, published_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description?.trim() || null,
        coverFile ? `/uploads/covers/${coverFile.filename}` : null,
        `/uploads/pdfs/${pdfFile.filename}`,
        published_at || null,
      ]
    );
    res.status(201).json({ id: result.insertId, message: 'Publicado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear' });
  }
};

// DELETE /api/books/:id (author only)
exports.remove = async (req, res) => {
  try {
    const [[book]] = await db.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (!book) return res.status(404).json({ error: 'No encontrado' });
    const del = (rel) => {
      if (!rel) return;
      const abs = path.join(__dirname, '..', rel);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    };
    del(book.pdf_path);
    del(book.cover_url);
    await db.query('DELETE FROM books WHERE id = ?', [req.params.id]);
    res.json({ message: 'Eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
};