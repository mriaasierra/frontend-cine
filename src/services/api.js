// Centralized API Service for Cinema Management System
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Función auxiliar para centralizar las peticiones HTTP y manejo de Tokens (JWT)
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Si existe un token guardado, lo inyectamos para pasar el authMiddleware del backend
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Error en la comunicación con el servidor');
  }

  // Como tu backend usa successResponse(), los datos reales vienen envueltos en .data
  return result.data || result;
};

// ============== AUTH API ==============
export const authApi = {
  // POST /api/auth/login
  login: async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    // Guardamos el token de inmediato para las siguientes consultas
    localStorage.setItem('token', data.token);

    // Adaptamos la respuesta del backend para que v0 no se rompa (necesita el rol en MAYÚSCULAS)
    return {
      token: data.token,
      user: {
        id: data.user.id,
        first_name: data.user.name.split(' ')[0] || '',
        last_name: data.user.name.split(' ')[1] || '',
        role: data.user.role.toUpperCase() // 'GERENTE' o 'EMPLEADO'
      }
    };
  },

  // GET /api/auth/me
  getProfile: async () => {
    const data = await apiRequest('/auth/me');
    return {
      user_id: data.id,
      first_name: data.name.split(' ')[0] || '',
      last_name: data.name.split(' ')[1] || '',
      email: data.email,
      role_name: data.role.toUpperCase()
    };
  }
};

// ============== USERS API ==============
export const usersApi = {
  // GET /api/users
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.role_id) query.append('role_id', params.role_id);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await apiRequest(`/users${queryString}`); 
  },

  // POST /api/users
  create: async (userData) => {
    return await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // PUT /api/users/:id
  update: async (id, userData) => {
    return await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  // DELETE /api/users/:id
  delete: async (id) => {
    return await apiRequest(`/users/${id}`, {
      method: 'DELETE'
    });
  }
};

// ============== CUSTOMERS API ==============
export const customersApi = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/customers${queryString}`);
    
    const items = res.data || res;
    const mapped = items.map(c => ({
      customer_id: c.customer_id,
      first_name: c.first_name,
      last_name: c.last_name,
      cedula: c.cedula,
      phone: c.phone,
      email: c.email
    }));

    if (res.pagination) {
      return {
        data: mapped,
        pagination: res.pagination
      };
    }
    return mapped;
  },
  create: async (data) => {
    return await apiRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  update: async (id, data) => {
    return await apiRequest(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  delete: async (id) => {
    return await apiRequest(`/customers/${id}`, {
      method: 'DELETE'
    });
  }
};

// ============== MOVIES API ==============
export const moviesApi = {
  // GET /api/movies
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.genre_id) query.append('genre_id', params.genre_id);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await apiRequest(`/movies${queryString}`);
  },

  // GET /api/movies/:id
  getById: async (id) => {
    return await apiRequest(`/movies/${id}`);
  },

  // POST /api/movies
  create: async (movieData) => {
    return await apiRequest('/movies', {
      method: 'POST',
      body: JSON.stringify(movieData)
    });
  },

  // PUT /api/movies/:id
  update: async (id, movieData) => {
    return await apiRequest(`/movies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(movieData)
    });
  },

  // DELETE /api/movies/:id
  delete: async (id) => {
    return await apiRequest(`/movies/${id}`, {
      method: 'DELETE'
    });
  }
};

// ============== GENRES API ==============
export const genresApi = {
  // GET /api/genres
  getAll: async () => {
    return await apiRequest('/genres');
  },

  // POST /api/genres
  create: async (name) => {
    return await apiRequest('/genres', {
      method: 'POST',
      body: JSON.stringify({ name })
    });
  },

  // PUT /api/genres/:id
  update: async (id, name) => {
    return await apiRequest(`/genres/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name })
    });
  },

  // DELETE /api/genres/:id
  delete: async (id) => {
    return await apiRequest(`/genres/${id}`, {
      method: 'DELETE'
    });
  }
};

// ============== CATEGORIES API ==============
export const categoriesApi = {
  getAll: async () => {
    return await apiRequest('/categories');
  }
};

// ============== ROOMS API ==============
export const roomsApi = {
  // GET /api/rooms
  getAll: async () => {
    return await apiRequest('/rooms');
  },

  // POST /api/rooms
  create: async (roomData) => {
    return await apiRequest('/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData)
    });
  },

  // PUT /api/rooms/:id
  update: async (id, roomData) => {
    return await apiRequest(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData)
    });
  },

  // DELETE /api/rooms/:id
  delete: async (id) => {
    return await apiRequest(`/rooms/${id}`, {
      method: 'DELETE'
    });
  }
};

// ============== SCREENINGS (FUNCIONES) API ==============
export const screeningsApi = {
  // GET /api/screenings
  getAll: async () => {
    return await apiRequest('/screenings');
  },

  // GET /api/screenings/:id (Adaptado para tu controlador)
  getByMovieId: async (movieId) => {
    return await apiRequest(`/screenings/${movieId}`);
  },

  // POST /api/screenings
  create: async (screeningData) => {
    return await apiRequest('/screenings', {
      method: 'POST',
      body: JSON.stringify(screeningData)
    });
  },

  // DELETE /api/screenings/:id
  delete: async (id) => {
    return await apiRequest(`/screenings/${id}`, {
      method: 'DELETE'
    });
  }
};

// ============== BOOKINGS API ==============
export const bookingsApi = {
  // GET /api/bookings
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await apiRequest(`/bookings${queryString}`);
  },

  // GET /api/bookings/:id
  getById: async (id) => {
    return await apiRequest(`/bookings/${id}`);
  },

  // POST /api/bookings
  create: async (bookingData) => {
    return await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  },

  // PATCH /api/bookings/:id/cancel
  cancel: async (id) => {
    return await apiRequest(`/bookings/${id}/cancel`, {
      method: 'PATCH'
    });
  }
};

// ============== SEATS API ==============
export const seatsApi = {
  // GET /api/seats/booking/:bookingId
  getByBooking: async (bookingId) => {
    return await apiRequest(`/seats/booking/${bookingId}`);
  },

  // POST /api/seats/assign
  assign: async (bookingId, seatsArray) => {
    return await apiRequest('/seats/assign', {
      method: 'POST',
      body: JSON.stringify({ bookingId, seats: seatsArray })
    });
  },

  // GET /api/seats/availability/:screeningId (Simulado hasta agregar la query al backend)
  getAvailability: async (screeningId) => {
    return ['A1', 'A2', 'B5']; 
  }
};

// ============== INVENTORY, MOVEMENTS & DASHBOARD MOCKS ==============
export const inventoryApi = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    if (params.category_id) query.append('category_id', params.category_id);
    
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/products${queryString}`);
    
    const items = res.data || res;
    const mappedItems = items.map(p => ({
      item_id: p.product_id,
      name: p.name,
      category_id: p.category_id,
      category: p.category_name,
      stock: p.current_stock,
      min_stock: p.min_stock,
      status: p.current_stock <= p.min_stock ? 'Bajo' : 'Normal'
    }));

    if (res.pagination) {
      return {
        data: mappedItems,
        pagination: res.pagination
      };
    }
    return mappedItems;
  },
  create: async (data) => {
    const backendData = {
      name: data.name,
      min_stock: Number(data.min_stock),
      category_id: Number(data.category_id)
    };
    const p = await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(backendData)
    });
    return {
      item_id: p.product_id,
      name: p.name,
      category_id: p.category_id,
      stock: p.current_stock,
      min_stock: p.min_stock,
      status: p.current_stock <= p.min_stock ? 'Bajo' : 'Normal'
    };
  },
  update: async (id, data) => {
    const backendData = {
      name: data.name,
      min_stock: Number(data.min_stock),
      category_id: Number(data.category_id)
    };
    const p = await apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendData)
    });
    return {
      item_id: p.product_id,
      name: p.name,
      category_id: p.category_id,
      stock: p.current_stock,
      min_stock: p.min_stock,
      status: p.current_stock <= p.min_stock ? 'Bajo' : 'Normal'
    };
  },
  delete: async (id) => {
    return await apiRequest(`/products/${id}`, {
      method: 'DELETE'
    });
  }
};

export const movementsApi = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.type) query.append('type', params.type);
    if (params.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/movements${queryString}`);
    const items = res.data || res;
    
    const mappedItems = items.map(m => ({
      movement_id: m.movement_id,
      item_name: m.item_name,
      type: m.movement_type,
      quantity: m.quantity,
      reason: m.movement_type === 'Entrada' ? 'Abastecimiento' : 'Venta/Ajuste',
      user_name: m.user_name,
      created_at: m.created_at
    }));

    if (res.pagination) {
      return {
        data: mappedItems,
        pagination: res.pagination
      };
    }
    return mappedItems;
  },
  create: async (data) => {
    const backendData = {
      product_id: Number(data.product_id),
      user_id: Number(data.user_id),
      movement_type: data.type,
      quantity: Number(data.quantity)
    };
    const m = await apiRequest('/movements', {
      method: 'POST',
      body: JSON.stringify(backendData)
    });
    return {
      movement_id: m.movement_id,
      item_name: m.item_name,
      type: m.movement_type,
      quantity: m.quantity,
      reason: m.movement_type === 'Entrada' ? 'Abastecimiento' : 'Venta/Ajuste',
      user_name: m.user_name || 'Tú',
      created_at: m.created_at
    };
  }
};

export const dashboardApi = {
  getStats: async () => {
    return await apiRequest('/admin/dashboard-stats');
  },
  getRecentBookings: async () => {
    try {
      const res = await apiRequest('/bookings?limit=5');
      const bookings = res.data || res;
      return bookings.map(b => ({
        booking_id: b.booking_id,
        customer_name: b.customer_name,
        movie_title: b.movie_title,
        seats: 3,
        status: b.booking_status,
        time: 'Reciente'
      }));
    } catch (e) {
      return [];
    }
  },
  getRoomOccupancy: async () => {
    try {
      const rooms = await apiRequest('/rooms');
      return rooms.map((r, i) => ({
        room_number: r.room_number,
        room_type: r.room_type,
        capacity: r.total_capacity,
        occupied: Math.round(r.total_capacity * (0.4 + (i * 0.1))),
        percentage: Math.round(40 + (i * 10))
      }));
    } catch (e) {
      return [];
    }
  },
  getLowStock: async () => {
    try {
      const res = await apiRequest('/products');
      const products = res.data || res;
      return products
        .filter(p => p.current_stock <= p.min_stock)
        .map(p => ({
          item_id: p.product_id,
          name: p.name,
          stock: p.current_stock,
          min_stock: p.min_stock,
          status: 'Bajo'
        }));
    } catch (e) {
      return [];
    }
  }
};