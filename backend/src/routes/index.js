const router  = require('express').Router();
const { authorOnly } = require('../middleware/auth');
const upload  = require('../middleware/upload');

const auth     = require('../controllers/authController');
const books    = require('../controllers/booksController');
const ratings  = require('../controllers/ratingsController');
const comments = require('../controllers/commentsController');

// Auth
router.post('/auth/login', auth.login);

// Books — lectura pública
router.get('/books',     books.list);
router.get('/books/:id', books.getOne);

// Books — solo autor
router.post(
  '/books',
  authorOnly,
  upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'cover', maxCount: 1 }]),
  books.create
);
router.delete('/books/:id', authorOnly, books.remove);

// Ratings — público
router.post('/books/:id/ratings', ratings.rate);

// Comments — lectura pública, borrar solo autor
router.get   ('/books/:id/comments', comments.list);
router.post  ('/books/:id/comments', comments.create);
router.delete('/comments/:id',       authorOnly, comments.remove);

module.exports = router;
