import { createContext, useContext, useState, useCallback } from 'react';
import { login as loginApi } from '../services/api.js';

const AuthCtx = createContext({ isAuthor: false, login: () => {}, logout: () => {} });

export function AuthProvider({ children }) {
  const [isAuthor, setIsAuthor] = useState(() => !!localStorage.getItem('wp_token'));

  const login = useCallback(async (username, password) => {
    const { data } = await loginApi({ username, password });
    localStorage.setItem('wp_token', data.token);
    setIsAuthor(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('wp_token');
    setIsAuthor(false);
  }, []);

  return (
    <AuthCtx.Provider value={{ isAuthor, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}