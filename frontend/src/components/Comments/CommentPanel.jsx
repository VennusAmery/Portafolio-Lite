import { useState, useEffect } from 'react';
import { getComments, postComment, delComment } from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.jsx';
import toast from 'react-hot-toast';
import { FiSend, FiTrash2 } from 'react-icons/fi';
import styles from './CommentPanel.module.css';

export default function CommentPanel({ bookId }) {
  const { isAuthor } = useAuth();
  const [comments, setComments] = useState([]);
  const [author,   setAuthor]   = useState('');
  const [body,     setBody]     = useState('');

  useEffect(() => {
    getComments(bookId).then(r => setComments(r.data)).catch(() => {});
  }, [bookId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    try {
      const { data } = await postComment(bookId, { author: author || 'Anónimo', body });
      setComments(c => [data, ...c]);
      setBody('');
    } catch { toast.error('Error al comentar'); }
  };

  const remove = async (id) => {
    try {
      await delComment(id);
      setComments(c => c.filter(x => x.id !== id));
    } catch { toast.error('Error al eliminar'); }
  };

  return (
    <section className={styles.panel}>
      <h3 className={styles.heading}>Comentarios <span>{comments.length}</span></h3>

      <form onSubmit={submit} className={styles.form}>
        <input value={author} onChange={e=>setAuthor(e.target.value)}
          placeholder="Tu nombre (opcional)" className={styles.nameInput} maxLength={80} />
        <textarea value={body} onChange={e=>setBody(e.target.value)}
          placeholder="Escribe tu comentario…" className={styles.textarea} rows={3} required />
        <button type="submit" className={styles.sendBtn}><FiSend /> Publicar</button>
      </form>

      <div className={styles.list}>
        {comments.length === 0 && <p className={styles.empty}>Sé el primero en comentar.</p>}
        {comments.map(c => (
          <div key={c.id} className={styles.comment}>
            <div className={styles.avatar}>{(c.author||'A')[0].toUpperCase()}</div>
            <div className={styles.body}>
              <div className={styles.meta}>
                <strong>{c.author || 'Anónimo'}</strong>
                <span>{new Date(c.created_at).toLocaleDateString('es')}</span>
              </div>
              <p className={styles.text}>{c.body}</p>
            </div>
            {isAuthor && (
              <button onClick={() => remove(c.id)} className={styles.del} title="Eliminar"><FiTrash2 /></button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
