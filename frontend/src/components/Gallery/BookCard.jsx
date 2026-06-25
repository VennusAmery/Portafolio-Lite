import { Link } from 'react-router-dom';
import StarRating from '../UI/StarRating.jsx';
import styles from './BookCard.module.css';

const BASE = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:4000';
const PH   = 'https://placehold.co/160x230/D9CEBB/6B5E4E?text=PDF';

export default function BookCard({ book }) {
  const cover = book.cover_url ? `${BASE}${book.cover_url}` : PH;
  return (
    <Link to={`/libro/${book.id}`} className={styles.card}>
      <div className={styles.coverWrap}>
        <img src={cover} alt={book.title} className={styles.cover}
          draggable={false} onContextMenu={e=>e.preventDefault()} />
        {book.genre_name && (
          <span className={styles.genre}>{book.genre_name}</span>
        )}
        <div className={styles.overlay}><span className={styles.readBtn}>Leer →</span></div>
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{book.title}</h3>
        <StarRating value={parseFloat(book.avg_stars)} total={book.total_ratings} />
      </div>
      <div className={styles.shelf} />
    </Link>
  );
}