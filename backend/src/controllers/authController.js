const jwt  = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// POST /api/auth/login
// El autor usa usuario/contraseña definidos en .env
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      username !== process.env.AUTHOR_USERNAME ||
      password !== process.env.AUTHOR_PASSWORD
    ) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { username, role: 'author' },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({ token });
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
};
