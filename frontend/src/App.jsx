import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth.jsx';
import Layout     from './pages/Layout.jsx';
import Gallery    from './pages/Gallery.jsx';
import BookPage   from './pages/BookPage.jsx';
import LoginPage  from './pages/LoginPage.jsx';
import UploadPage from './pages/UploadPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster position="top-right" toastOptions={{
          style: { background: 'var(--white)', color: 'var(--ink)', border: '1px solid var(--cream-dark)', fontFamily: 'var(--font-body)' }
        }} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/libros" replace />} />
            <Route path="/libros"    element={<Gallery />} />
            <Route path="/libro/:id" element={<BookPage />} />
            <Route path="/subir"     element={<UploadPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}