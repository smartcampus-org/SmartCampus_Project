import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Injecte le token JWT automatiquement
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirige vers login si 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  register: (data) => api.post('/auth/register', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
}

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  changePassword: (data) => api.put('/user/password', data),
}

export const adminAPI = {
  test: () => api.get('/admin/test'),
}

export const etudiantAPI = {
  test: () => api.get('/etudiant/test'),
}

// SC-109 — API Bâtiments
export const buildingAPI = {
  getAll: () => api.get('/buildings'),
  getById: (id) => api.get(`/buildings/${id}`),
  create: (data) => api.post('/buildings', data),
  update: (id, data) => api.put(`/buildings/${id}`, data),
  delete: (id) => api.delete(`/buildings/${id}`),
}

// SC-109 — API Salles
export const roomAPI = {
  getAll: (params) => api.get('/rooms', { params }),
  getById: (id) => api.get(`/rooms/${id}`),
  search: (params) => api.get('/rooms/search', { params }),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
  changeStatus: (id, data) => api.patch(`/rooms/${id}/status`, data),
  getStatusHistory: (id, params) => api.get(`/rooms/${id}/status-history`, { params }),
  exportCsv: () => api.get('/rooms/export', { responseType: 'blob' }),
}

// SC-109 — API Équipements
export const equipmentAPI = {
  findByRoom: (roomId) => api.get(`/rooms/${roomId}/equipments`),
  getById: (roomId, id) => api.get(`/rooms/${roomId}/equipments/${id}`),
  create: (roomId, data) => api.post(`/rooms/${roomId}/equipments`, data),
  update: (roomId, id, data) => api.put(`/rooms/${roomId}/equipments/${id}`, data),
  delete: (roomId, id) => api.delete(`/rooms/${roomId}/equipments/${id}`),
}

export default api
