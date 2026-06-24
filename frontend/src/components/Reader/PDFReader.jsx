import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { FiZoomIn, FiZoomOut } from 'react-icons/fi';
import styles from './PDFReader.module.css';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const BASE = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:4000';

export default function PDFReader({ pdfPath }) {
  const wrapRef   = useRef(null);
  const pdfRef    = useRef(null);
  const [total,   setTotal]   = useState(0);
  const [current, setCurrent] = useState(1);
  const [scale,   setScale]   = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  // Cargar PDF y renderizar todas las páginas
  useEffect(() => {
    if (!pdfPath) return;
    setError(false);
    setLoading(true);
    pdfRef.current = null;

    const url = `${BASE}${pdfPath.startsWith('/') ? pdfPath : '/' + pdfPath}`;

    pdfjsLib.getDocument({ url }).promise
      .then(pdf => {
        pdfRef.current = pdf;
        setTotal(pdf.numPages);
      })
      .catch(err => {
        console.error('PDF load error:', err);
        setError(true);
        setLoading(false);
      });
  }, [pdfPath]);

  // Renderizar todas las páginas cuando el PDF carga o cambia el scale
  useEffect(() => {
    if (!pdfRef.current || !wrapRef.current) return;
    const pdf = pdfRef.current;

    const renderAll = async () => {
      setLoading(true);
      const container = wrapRef.current;
      container.innerHTML = ''; // limpiar páginas anteriores

      for (let i = 1; i <= pdf.numPages; i++) {
        const pg  = await pdf.getPage(i);
        const vp  = pg.getViewport({ scale });

        // Wrapper de página
        const pageDiv = document.createElement('div');
        pageDiv.className = styles.pageWrap;
        pageDiv.setAttribute('data-page', i);

        const canvas = document.createElement('canvas');
        canvas.width  = vp.width;
        canvas.height = vp.height;
        canvas.className = styles.canvas;

        pageDiv.appendChild(canvas);
        container.appendChild(pageDiv);

        await pg.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
      }
      setLoading(false);
    };

    renderAll();
  }, [scale, total]);

  // Detectar página actual según scroll
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const onScroll = () => {
      const pages = wrap.querySelectorAll(`[data-page]`);
      for (const p of pages) {
        const rect = p.getBoundingClientRect();
        if (rect.top >= 0 || rect.bottom > window.innerHeight / 2) {
          setCurrent(parseInt(p.getAttribute('data-page')));
          break;
        }
      }
    };
    wrap.addEventListener('scroll', onScroll);
    return () => wrap.removeEventListener('scroll', onScroll);
  }, [total]);

  // Protección IP
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const no = (e) => e.preventDefault();
    wrap.addEventListener('contextmenu', no);
    wrap.addEventListener('dragstart',   no);
    wrap.addEventListener('copy',        no);
    const noKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && 'cusp'.includes(e.key.toLowerCase()))
        e.preventDefault();
    };
    document.addEventListener('keydown', noKey);
    return () => {
      wrap.removeEventListener('contextmenu', no);
      wrap.removeEventListener('dragstart',   no);
      wrap.removeEventListener('copy',        no);
      document.removeEventListener('keydown', noKey);
    };
  }, []);

  if (error) return (
    <div className={styles.err}>
      No se pudo cargar el PDF.
      <small>Backend: {BASE}</small>
    </div>
  );

  return (
    <div className={styles.reader}>
      <div className={styles.toolbar}>
        <span className={styles.pageInfo}>Página {current} / {total}</span>
        <div className={styles.zoom}>
          <button onClick={() => setScale(s => Math.max(.5, +(s - .15).toFixed(2)))}><FiZoomOut /></button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(3,  +(s + .15).toFixed(2)))}><FiZoomIn /></button>
        </div>
        {loading && <span className={styles.loadingText}>Cargando…</span>}
      </div>

      <div ref={wrapRef} className={`${styles.wrap} pdf-wrap no-sel`} />
    </div>
  );
}