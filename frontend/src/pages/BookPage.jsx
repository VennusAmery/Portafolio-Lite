import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getBook, rateBook, deleteBook } from '../services/api.js';
import PDFReader    from '../components/Reader/PDFReader.jsx';
import CommentPanel from '../components/Comments/CommentPanel.jsx';
import StarRating   from '../components/UI/StarRating.jsx';
import { useAuth }  from '../hooks/useAuth.jsx';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import styles from './BookPage.module.css';

const BASE = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:4000';

export default function BookPage() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { isAuthor } = useAuth();
  const [book,    setBook]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting,setDeleting]= useState(false);

  useEffect(() => {
    getBook(id).then(r => setBook(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  }, [id]);

  const handleRate = async (stars) => {
    try {
      const { data } = await rateBook(id, stars);
      setBook(b => ({ ...b, avg_stars: data.avg_stars, total_ratings: data.total_ratings }));
      toast.success('¡Gracias por tu calificación!');
    } catch { toast.error('Error al calificar'); }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${book.title}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    try {
      await deleteBook(book.id);
      toast.success('Escrito eliminado');
      navigate('/libros');
    } catch { toast.error('Error al eliminar'); setDeleting(false); }
  };

  if (loading) return <div className={styles.center}><div className={styles.spin} /></div>;
  if (!book)   return <div className={styles.center}><h2>No encontrado</h2><Link to="/libros">← Volver</Link></div>;

  return (
    <div className={styles.layout}>
      <div className={styles.readerCol}>
        <div className={styles.topBar}>
          <Link to="/libros" className={styles.back}><FiArrowLeft /> Biblioteca</Link>
          <div className={styles.meta}>
            <h2 className={styles.title}>{book.title}</h2>
            <div className={styles.ratingRow}>
              <StarRating value={parseFloat(book.avg_stars)} total={book.total_ratings} />
              <span className={styles.rateLabel}>Tu nota:</span>
              <StarRating interactive onRate={handleRate} />
            </div>
          </div>
          {isAuthor && (
            <button onClick={handleDelete} disabled={deleting} className={styles.deleteBtn}
              title="Eliminar este escrito">
              <FiTrash2 /> {deleting ? 'Eliminando…' : 'Eliminar'}
            </button>
          )}
        </div>
        <PDFReader pdfPath={book.pdf_path} />
      </div>

      <aside className={styles.aside}>
        {book.cover_url && (
          <img src={`${BASE}${book.cover_url}`} alt={book.title}
            className={styles.cover} draggable={false} onContextMenu={e=>e.preventDefault()} />
        )}
        {book.description && <p className={styles.desc}>{book.description}</p>}
        {book.published_at && (
          <p className={styles.date}>Publicado: {new Date(book.published_at).toLocaleDateString('es')}</p>
        )}
        <hr className={styles.hr} />
        <CommentPanel bookId={book.id} />
      </aside>
    </div>
  );
}