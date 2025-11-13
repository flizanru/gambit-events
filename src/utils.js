import { API_URL } from './App';

export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };
    
    const response = await fetch(`${API_URL}${endpoint}`, config);
    if (!response.ok) throw new Error('Request failed');
    return await response.json();
  },
  
  login: (credentials) => api.request('/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getEvents: (userId) => api.request(`/users/${userId}/events`),
  createEvent: (event) => api.request('/events', { method: 'POST', body: JSON.stringify(event) }),
  deleteEvent: (id) => api.request(`/events/${id}`, { method: 'DELETE' }),
  deleteAllUserEvents: (userId) => api.request(`/users/${userId}/events`, { method: 'DELETE' }),
  deleteAllEvents: () => api.request('/events', { method: 'DELETE' }),
  getUsers: () => api.request('/users'),
  updateWarnings: (userId, action) => api.request(`/users/${userId}/warnings`, { method: 'PATCH', body: JSON.stringify({ action }) })
};

export const Spinner = () => <div className="spinner"></div>;

export const SkeletonRow = () => (
  <div className="skeleton-row">
    <div className="skeleton"></div>
    <div className="skeleton"></div>
    <div className="skeleton"></div>
    <div className="skeleton"></div>
    <div className="skeleton"></div>
  </div>
);

export const SkeletonEvent = () => (
  <div className="skeleton-event">
    <div className="skeleton"></div>
    <div className="skeleton small"></div>
    <div className="skeleton small"></div>
  </div>
);
