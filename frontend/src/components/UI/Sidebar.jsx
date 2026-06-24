import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { FiBook, FiUpload, FiLogIn, FiLogOut } from 'react-icons/fi';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const { isAuthor, logout } = useAuth();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.icon}>✦</span>
        <span className={styles.name}>Portafolio</span>
      </div>

      <nav className={styles.nav}>
        <NavLink to="/libros" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          <FiBook /> Biblioteca
        </NavLink>
        {isAuthor && (
          <NavLink to="/subir" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
            <FiUpload /> Subir escrito
          </NavLink>
        )}
      </nav>

      <div className={styles.bottom}>
        {isAuthor ? (
          <button onClick={logout} className={styles.authBtn}><FiLogOut /> Salir</button>
        ) : (
          <NavLink to="/login" className={styles.authBtn}><FiLogIn /> Autor</NavLink>
        )}
      </div>
    </aside>
  );
}
