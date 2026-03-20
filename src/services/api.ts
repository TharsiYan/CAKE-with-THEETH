import type { Cake, Comment, ShopSettings } from '@/types';

// API URL - uses relative path for same-origin requests
// This works for both local development and production
const API_URL = '/api';

// Helper function for API calls
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  
  // Add auth token if available
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
    };
  }
  
  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// Form data helper for file uploads
async function fetchFormData<T>(
  endpoint: string,
  formData: FormData,
  method: string = 'POST'
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const config: RequestInit = {
    method,
    headers: {},
    body: formData,
  };
  
  // Add auth token if available
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers = {
      'Authorization': `Bearer ${token}`,
    };
  }
  
  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// Public API
export const shopApi = {
  getSettings: () => fetchApi<ShopSettings>('/shop'),
};

export const cakesApi = {
  getAll: () => fetchApi<Cake[]>('/cakes'),
  getById: (id: number) => fetchApi<Cake>(`/cakes/${id}`),
  like: (id: number) => fetchApi<{ likes: number }>(`/cakes/${id}/like`, { method: 'POST' }),
  addComment: (id: number, data: { visitor_name: string; comment: string }) =>
    fetchApi<Comment>(`/cakes/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  rate: (id: number, rating: number) =>
    fetchApi<{ average_rating: number }>(`/cakes/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating }),
    }),
};

// Admin API
export const adminApi = {
  login: (username: string, password: string) =>
    fetchApi<{ token: string; username: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  
  updateCredentials: (data: { currentPassword: string; newUsername?: string; newPassword?: string }) =>
    fetchApi('/admin/credentials', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  updateShop: (data: Partial<ShopSettings>) =>
    fetchApi<ShopSettings>('/shop', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  getAllCakes: () => fetchApi<Cake[]>('/admin/cakes'),
  
  createCake: (formData: FormData) =>
    fetchFormData<Cake>('/admin/cakes', formData),
  
  updateCake: (id: number, formData: FormData) =>
    fetchFormData<Cake>(`/admin/cakes/${id}`, formData, 'PUT'),
  
  deleteCake: (id: number) =>
    fetchApi(`/admin/cakes/${id}`, { method: 'DELETE' }),
  
  deleteImage: (cakeId: number, imagePath: string) =>
    fetchApi(`/admin/cakes/${cakeId}/images`, {
      method: 'DELETE',
      body: JSON.stringify({ imagePath }),
    }),
  
  deleteVideo: (cakeId: number) =>
    fetchApi(`/admin/cakes/${cakeId}/video`, { method: 'DELETE' }),
  
  deleteComment: (commentId: number) =>
    fetchApi(`/admin/comments/${commentId}`, { method: 'DELETE' }),
};

// WhatsApp helper
export const getWhatsAppLink = (phone: string, message: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};
