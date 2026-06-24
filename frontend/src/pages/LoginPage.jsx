import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await login(form.username, form.password);
      toast.success('Bienvenida ✦');
      navigate('/libros');
    } catch { toast.error('Credenciales incorrectas'); }
    finally { setLoading(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <span className={styles.icon}>✦</span>
        <h1 className={styles.title}>Acceso del Autor</h1>
        <p className={styles.sub}>Solo el autor puede iniciar sesión</p>
        <form onSubmit={submit} className={styles.form}>
          <input value={form.username} onChange={e=>setForm(f=>({...f,username:e.target.value}))}
            placeholder="Usuario" required className={styles.input} />
          <input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}
            placeholder="Contraseña" autocomplete="current-password" required className={styles.input} />
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? '…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
