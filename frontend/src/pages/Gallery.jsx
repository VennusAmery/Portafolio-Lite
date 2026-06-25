import { useState, useEffect, useCallback } from 'react';
import { getBooks, getGenres } from '../services/api.js';
import BookCard from '../components/Gallery/BookCard.jsx';
import { FiSearch } from 'react-icons/fi';
import styles from './Gallery.module.css';

const SORTS = [
  { value: 'created_at_desc', label: 'Más recientes'   },
  { value: 'title_asc',       label: 'A → Z'            },
  { value: 'title_desc',      label: 'Z → A'            },
  { value: 'date_asc',        label: 'Fecha ↑'          },
  { value: 'date_desc',       label: 'Fecha ↓'          },
  { value: 'rating_desc',     label: 'Mejor valorados'  },
];

export default function Gallery() {
  const [books,   setBooks]   = useState([]);
  const [genres,  setGenres]  = useState([]);
  const [meta,    setMeta]    = useState({});
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState({
    search: '', sort: 'created_at_desc',
    genre_id: '', date_from: '', date_to: '', page: 1,
  });

  useEffect(() => {
    getGenres().then(r => setGenres(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...q };
      if (!params.genre_id) delete params.genre_id;
      const { data } = await getBooks(params);
      setBooks(data.data);
      setMeta(data.meta);
    } catch {}
    finally { setLoading(false); }
  }, [q]);

  useEffect(() => { load(); }, [load]);

  const set = (k, v) => setQ(p => ({ ...p, [k]: v, page: 1 }));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Biblioteca</h1>
        <p className={styles.sub}>{meta.total ?? '…'} escritos</p>
      </header>

      {/* Filtros */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIco} />
          <input value={q.search} onChange={e => set('search', e.target.value)}
            placeholder="Buscar por título…" className={styles.searchInput} />
        </div>
        <select value={q.sort} onChange={e => set('sort', e.target.value)} className={styles.select}>
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={q.genre_id} onChange={e => set('genre_id', e.target.value)} className={styles.select}>
          <option value="">Todos los géneros</option>
          {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <input type="date" value={q.date_from} onChange={e => set('date_from', e.target.value)} className={styles.date} title="Desde" />
        <input type="date" value={q.date_to}   onChange={e => set('date_to',   e.target.value)} className={styles.date} title="Hasta" />
      </div>

      {/* Chips de géneros */}
      <div className={styles.chips}>
        <button className={`${styles.chip} ${q.genre_id === '' ? styles.chipActive : ''}`}
          onClick={() => set('genre_id', '')}>Todos</button>
        {genres.map(g => (
          <button key={g.id}
            className={`${styles.chip} ${q.genre_id == g.id ? styles.chipActive : ''}`}
            onClick={() => set('genre_id', g.id)}>
            {g.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.grid}>{[...Array(8)].map((_,i) => <div key={i} className={styles.skel} />)}</div>
      ) : books.length === 0 ? (
        <div className={styles.empty}><span>📚</span><p>Sin resultados.</p></div>
      ) : (
        <section className={styles.shelf}>
          <div className={styles.grid}>{books.map(b => <BookCard key={b.id} book={b} />)}</div>
          <div className={styles.rail} />
        </section>
      )}

      {meta.pages > 1 && (
        <div className={styles.pages}>
          <button disabled={q.page<=1} onClick={()=>setQ(p=>({...p,page:p.page-1}))}>‹ Anterior</button>
          <span>{q.page} / {meta.pages}</span>
          <button disabled={q.page>=meta.pages} onClick={()=>setQ(p=>({...p,page:p.page+1}))}>Siguiente ›</button>
        </div>
      )}
    </div>
  );
}