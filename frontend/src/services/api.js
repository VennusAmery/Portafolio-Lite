import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api' });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('wp_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const login       = (d)         => api.post('/auth/login', d);
export const getBooks    = (params)    => api.get('/books', { params });
export const getBook     = (id)        => api.get(`/books/${id}`);
export const createBook  = (form)      => api.post('/books', form, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteBook  = (id)        => api.delete(`/books/${id}`);
export const rateBook    = (id, stars) => api.post(`/books/${id}/ratings`, { stars });
export const getComments = (id)        => api.get(`/books/${id}/comments`);
export const postComment = (id, data)  => api.post(`/books/${id}/comments`, data);
export const delComment  = (id)        => api.delete(`/comments/${id}`);
export const getGenres   = ()          => api.get('/genres');

export default api;