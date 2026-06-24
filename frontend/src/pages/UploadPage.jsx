import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { createBook } from '../services/api.js';
import toast from 'react-hot-toast';
import { FiUpload } from 'react-icons/fi';
import styles from './UploadPage.module.css';

export default function UploadPage() {
  const { isAuthor } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]   = useState({ title: '', description: '', published_at: '' });
  const [pdf,  setPdf]    = useState(null);
  const [cover,setCover]  = useState(null);
  const [busy, setBusy]   = useState(false);

  if (!isAuthor) return (
    <div className={styles.denied}><h2>Acceso restringido</h2><p>Solo el autor puede subir escritos.</p></div>
  );

  const submit = async (e) => {
    e.preventDefault();
    if (!pdf) return toast.error('Selecciona un PDF');
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('title',        form.title);
      fd.append('description',  form.description);
      fd.append('published_at', form.published_at);
      fd.append('pdf',   pdf);
      if (cover) fd.append('cover', cover);
      await createBook(fd);
      toast.success('¡Escrito publicado!');
      navigate('/libros');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al subir');
    } finally { setBusy(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Subir nuevo escrito</h1>
        <form onSubmit={submit} className={styles.form}>
          <label className={styles.label}>
            Título *
            <input required value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
              className={styles.input} placeholder="El título de tu escrito" />
          </label>
          <label className={styles.label}>
            Descripción
            <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
              className={styles.textarea} rows={3} placeholder="Sinopsis o descripción breve…" />
          </label>
          <label className={styles.label}>
            Fecha de publicación
            <input type="date" value={form.published_at} onChange={e=>setForm(f=>({...f,published_at:e.target.value}))}
              className={styles.input} />
          </label>
          <label className={styles.label}>
            Archivo PDF *
            <div className={`${styles.dropzone} ${pdf ? styles.hasFile : ''}`}
              onClick={() => document.getElementById('pdf-input').click()}>
              <FiUpload className={styles.dropIco} />
              <span>{pdf ? pdf.name : 'Seleccionar PDF (máx. 50 MB)'}</span>
              <input id="pdf-input" type="file" accept=".pdf" className={styles.hidden}
                onChange={e => setPdf(e.target.files[0])} />
            </div>
          </label>
          <label className={styles.label}>
            Portada (imagen opcional)
            <div className={`${styles.dropzone} ${cover ? styles.hasFile : ''}`}
              onClick={() => document.getElementById('cover-input').click()}>
              <FiUpload className={styles.dropIco} />
              <span>{cover ? cover.name : 'Seleccionar imagen JPG/PNG/WEBP'}</span>
              <input id="cover-input" type="file" accept="image/jpeg,image/png,image/webp" className={styles.hidden}
                onChange={e => setCover(e.target.files[0])} />
            </div>
          </label>
          <button type="submit" className={styles.btn} disabled={busy}>
            {busy ? 'Subiendo…' : 'Publicar escrito'}
          </button>
        </form>
      </div>
    </div>
  );
}
