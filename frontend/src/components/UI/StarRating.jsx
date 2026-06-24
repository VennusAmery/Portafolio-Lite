import { useState } from 'react';
import styles from './StarRating.module.css';

export default function StarRating({ value = 0, total = 0, interactive = false, onRate }) {
  const [hover, setHover] = useState(0);
  return (
    <div className={styles.wrap}>
      {[1,2,3,4,5].map(n => (
        <button key={n}
          className={`${styles.star} ${(hover || Math.round(value)) >= n ? styles.on : ''}`}
          onClick={()  => interactive && onRate?.(n)}
          onMouseEnter={()=> interactive && setHover(n)}
          onMouseLeave={()=> interactive && setHover(0)}
          disabled={!interactive}
        >★</button>
      ))}
      {total > 0 && <span className={styles.count}>{Number(value).toFixed(1)} ({total})</span>}
    </div>
  );
}
