import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { FiZoomIn, FiZoomOut } from 'react-icons/fi';
import styles from './PDFReader.module.css';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const BASE = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:4000';

export default function PDFReader({ pdfPath }) {
  const containerRef = useRef(null);
  const [pdf,     setPdf]     = useState(null);
  const [total,   setTotal]   = useState(0);
  const [current, setCurrent] = useState(1);
  const [scale,   setScale]   = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  // 1. Cargar PDF
  useEffect(() => {
    if (!pdfPath) return;
    setPdf(null);
    setError(false);
    setLoading(true);
    setTotal(0);

    const url = `${BASE}${pdfPath.startsWith('/') ? pdfPath : '/' + pdfPath}`;
    console.log('Cargando PDF:', url);

    pdfjsLib.getDocument({ url }).promise
      .then(doc => {
        console.log('PDF cargado, páginas:', doc.numPages);
        setPdf(doc);
        setTotal(doc.numPages);
      })
      .catch(err => {
        console.error('Error cargando PDF:', err);
        setError(true);
        setLoading(false);
      });
  }, [pdfPath]);

  // 2. Renderizar todas las páginas cuando pdf cambia o scale cambia
  useEffect(() => {
    if (!pdf || !containerRef.current) return;

    let cancelled = false;

    const renderAll = async () => {
      setLoading(true);
      const container = containerRef.current;
      container.innerHTML = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        if (cancelled) break;
        try {
          const pg  = await pdf.getPage(i);
          const vp  = pg.getViewport({ scale });
          const div = document.createElement('div');
          div.setAttribute('data-page', i);
          div.style.marginBottom = '16px';
          div.style.flexShrink   = '0';
          div.style.boxShadow    = '0 8px 32px rgba(0,0,0,0.4)';

          const canvas  = document.createElement('canvas');
          canvas.width  = vp.width;
          canvas.height = vp.height;
          canvas.style.display = 'block';

          div.appendChild(canvas);
          container.appendChild(div);

          if (!cancelled) {
            await pg.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
          }
        } catch (err) {
          console.error(`Error en página ${i}:`, err);
        }
      }

      if (!cancelled) setLoading(false);
    };

    renderAll();
    return () => { cancelled = true; };
  }, [pdf, scale]);

  // 3. Detectar página actual por scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onScroll = () => {
      const pages = container.querySelectorAll('[data-page]');
      for (const p of pages) {
        const rect = p.getBoundingClientRect();
        if (rect.bottom > 0) {
          setCurrent(parseInt(p.getAttribute('data-page')));
          break;
        }
      }
    };
    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, [total]);

  // 4. Protección IP
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const no = (e) => e.preventDefault();
    container.addEventListener('contextmenu', no);
    container.addEventListener('dragstart',   no);
    container.addEventListener('copy',        no);
    const noKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && 'cusp'.includes(e.key.toLowerCase()))
        e.preventDefault();
    };
    document.addEventListener('keydown', noKey);
    return () => {
      container.removeEventListener('contextmenu', no);
      container.removeEventListener('dragstart',   no);
      container.removeEventListener('copy',        no);
      document.removeEventListener('keydown', noKey);
    };
  }, []);

  if (error) return (
    <div className={styles.err}>
      No se pudo cargar el PDF.
      <small>URL: {BASE}{pdfPath}</small>
    </div>
  );

  return (
    <div className={styles.reader}>
      <div className={styles.toolbar}>
        <span className={styles.pageInfo}>
          Página {current} / {total || '…'}
        </span>
        <div className={styles.zoom}>
          <button onClick={() => setScale(s => Math.max(.5, +(s - .15).toFixed(2)))}><FiZoomOut /></button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(3,  +(s + .15).toFixed(2)))}><FiZoomIn /></button>
        </div>
        {loading && <span className={styles.loadingText}>Cargando…</span>}
      </div>

      <div
        ref={containerRef}
        className={`${styles.wrap} pdf-wrap no-sel`}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }}
      />
    </div>
  );
}