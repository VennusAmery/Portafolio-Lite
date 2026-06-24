import { Outlet } from 'react-router-dom';
import Sidebar from '../components/UI/Sidebar.jsx';
import styles from './Layout.module.css';

export default function Layout() {
  return (
    <div className={styles.app}>
      <Sidebar />
      <main className={styles.content}><Outlet /></main>
    </div>
  );
}
