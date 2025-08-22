import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register/student', userData),
  getProfile: () => api.get('/auth/me'),
};

// Books API
export const booksAPI = {
  getAll: (params) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  create: (bookData) => api.post('/books', bookData),
  update: (id, bookData) => api.put(`/books/${id}`, bookData),
  delete: (id) => api.delete(`/books/${id}`),
};

// Students API
export const studentsAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  update: (id, studentData) => api.put(`/students/${id}`, studentData),
  getBorrowingHistory: (id) => api.get(`/students/${id}/borrowing-history`),
};

// Issued Books API
export const issuedBooksAPI = {
  getAll: (params) => api.get('/issued-books', { params }),
  issue: (issueData) => api.post('/issued-books/issue', issueData),
  return: (id, returnData) => api.put(`/issued-books/${id}/return`, returnData),
  getOverdue: () => api.get('/issued-books/overdue'),
};

// Suggested Books API
export const suggestedBooksAPI = {
  getAll: (params) => api.get('/suggested-books', { params }),
  create: (suggestionData) => api.post('/suggested-books', suggestionData),
  review: (id, reviewData) => api.put(`/suggested-books/${id}/review`, reviewData),
  delete: (id) => api.delete(`/suggested-books/${id}`),
};

// Courses API
export const coursesAPI = {
  getAll: () => api.get('/courses'),
  create: (courseData) => api.post('/courses', courseData),
};

// Librarians API
export const librariansAPI = {
  create: (librarianData) => api.post('/librarians', librarianData),
  getProfile: () => api.get('/librarians/profile'),
  updateProfile: (profileData) => api.put('/librarians/profile', profileData),
};

export default api;

