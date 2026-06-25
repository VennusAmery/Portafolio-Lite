const router  = require('express').Router();
const { authorOnly } = require('../middleware/auth');
const upload  = require('../middleware/upload');

const auth     = require('../controllers/authController');
const books    = require('../controllers/booksController');
const ratings  = require('../controllers/ratingsController');
const comments = require('../controllers/commentsController');
const genres   = require('../controllers/genresController');

router.post('/auth/login', auth.login);

// Géneros — público
router.get('/genres', genres.list);

// Books
router.get('/books',     books.list);
router.get('/books/:id', books.getOne);
router.post('/books', authorOnly,
  upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'cover', maxCount: 1 }]),
  books.create
);
router.delete('/books/:id', authorOnly, books.remove);

// Ratings
router.post('/books/:id/ratings', ratings.rate);

// Comments
router.get   ('/books/:id/comments', comments.list);
router.post  ('/books/:id/comments', comments.create);
router.delete('/comments/:id',       authorOnly, comments.remove);

module.exports = router;