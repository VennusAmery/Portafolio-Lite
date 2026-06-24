import { useState, useEffect, useCallback } from 'react';
import { getBooks } from '../services/api.js';
import BookCard from '../components/Gallery/BookCard.jsx';

import { FiSearch } from 'react-icons/fi';
import styles from './Gallery.module.css';

const SORTS = [
  { value: 'created_at_desc', label: 'Más recientes' },
  { value: 'title_asc',       label: 'A → Z'         },
  { value: 'title_desc',      label: 'Z → A'         },
  { value: 'date_asc',        label: 'Fecha ↑'       },
  { value: 'date_desc',       label: 'Fecha ↓'       },
  { value: 'rating_desc',     label: 'Mejor valorados'},
];

export default function Gallery() {
  const [books,   setBooks]   = useState([]);
  const [meta,    setMeta]    = useState({});
  const [loading, setLoading] = useState(true);
  const [q,       setQ]       = useState({ search: '', sort: 'created_at_desc', date_from: '', date_to: '', page: 1 });

  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await getBooks(q); setBooks(data.data); setMeta(data.meta); }
    catch {}
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

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIco} />
          <input value={q.search} onChange={e => set('search', e.target.value)}
            placeholder="Buscar por título…" className={styles.searchInput} />
        </div>
        <select value={q.sort} onChange={e => set('sort', e.target.value)} className={styles.select}>
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <input type="date" value={q.date_from} onChange={e => set('date_from', e.target.value)} className={styles.date} title="Desde" />
        <input type="date" value={q.date_to}   onChange={e => set('date_to',   e.target.value)} className={styles.date} title="Hasta" />
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
