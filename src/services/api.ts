const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// ─── Token management ────────────────────────────────────────────────

let authToken: string | null = localStorage.getItem('spoon_token');

export function setToken(token: string) {
  authToken = token;
  localStorage.setItem('spoon_token', token);
}

export function clearToken() {
  authToken = null;
  localStorage.removeItem('spoon_token');
}

export function getToken(): string | null {
  return authToken;
}

// ─── HTTP client ─────────────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.error || `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message, errorBody.details);
  }

  return response.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

// ─── Auth API ────────────────────────────────────────────────────────

export const authApi = {
  login(phone: string, role: 'CUSTOMER' | 'COOK' = 'CUSTOMER') {
    return request<{ message: string; otp?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, role }),
    });
  },

  verify(phone: string, otp: string, role: 'CUSTOMER' | 'COOK' = 'CUSTOMER') {
    return request<{
      token: string;
      user: { id: string; phone: string; name: string | null; role: string; isNew: boolean };
    }>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, role }),
    });
  },

  getProfile() {
    return request<{
      id: string;
      phone: string;
      name: string | null;
      email: string | null;
      role: string;
      avatarUrl: string | null;
      addresses: Address[];
      cookProfile: CookProfile | null;
    }>('/auth/profile');
  },

  updateProfile(data: { name?: string; email?: string; avatarUrl?: string }) {
    return request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  addAddress(data: {
    label: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    lat: number;
    lng: number;
    isDefault?: boolean;
  }) {
    return request<Address>('/auth/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAddresses() {
    return request<Address[]>('/auth/addresses');
  },

  deleteAddress(id: string) {
    return request(`/auth/addresses/${id}`, { method: 'DELETE' });
  },
};

// ─── Orders API ──────────────────────────────────────────────────────

export const ordersApi = {
  create(data: {
    addressId: string;
    serviceDuration: number;
    scheduledAt: string;
    specialInstructions?: string;
    menuItems?: Array<{ id: string; name: string; quantity?: number }>;
  }) {
    return request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getById(id: string) {
    return request<Order>(`/orders/${id}`);
  },

  getMyOrders(page = 1, limit = 20) {
    return request<{
      orders: Order[];
      total: number;
      page: number;
      totalPages: number;
    }>(`/orders/my?page=${page}&limit=${limit}`);
  },

  getCookOrders(status?: string) {
    const query = status ? `?status=${status}` : '';
    return request<Order[]>(`/orders/cook${query}`);
  },

  accept(orderId: string) {
    return request<Order>(`/orders/${orderId}/accept`, { method: 'POST' });
  },

  arriving(orderId: string) {
    return request<Order>(`/orders/${orderId}/arriving`, { method: 'POST' });
  },

  startCooking(orderId: string) {
    return request<Order>(`/orders/${orderId}/start`, { method: 'POST' });
  },

  endCooking(orderId: string) {
    return request<Order>(`/orders/${orderId}/end`, { method: 'POST' });
  },

  cancel(orderId: string, reason?: string) {
    return request<Order>(`/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};

// ─── Payments API ────────────────────────────────────────────────────

export const paymentsApi = {
  createOrder(orderId: string) {
    return request<{
      paymentId: string;
      razorpayOrderId: string;
      amount: number;
      currency: string;
      key: string;
    }>(`/payments/order/${orderId}`, { method: 'POST' });
  },

  verify(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    return request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getStatus(orderId: string) {
    return request(`/payments/status/${orderId}`);
  },
};

// ─── Reviews API ─────────────────────────────────────────────────────

export const reviewsApi = {
  create(data: { orderId: string; rating: number; comment?: string }) {
    return request('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getCookReviews(cookId: string, page = 1, limit = 20) {
    return request<{
      reviews: Review[];
      total: number;
      page: number;
      totalPages: number;
      ratingBreakdown: Record<number, number>;
    }>(`/reviews/cook/${cookId}?page=${page}&limit=${limit}`);
  },
};

// ─── Cooks API ───────────────────────────────────────────────────────

export const cooksApi = {
  getPublicProfile(userId: string) {
    return request<{
      id: string;
      bio: string;
      specialties: string[];
      yearsOfExperience: number;
      rating: number;
      totalSessions: number;
      user: { name: string; avatarUrl: string | null };
    }>(`/cooks/public/${userId}`);
  },

  onboard(data: {
    bio: string;
    specialties: string[];
    yearsOfExperience: number;
    hourlyRate: number;
    idProofUrl?: string;
    certificateUrl?: string;
  }) {
    return request('/cooks/onboard', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMyProfile() {
    return request('/cooks/profile');
  },

  setAvailability(isAvailable: boolean) {
    return request('/cooks/availability', {
      method: 'PUT',
      body: JSON.stringify({ isAvailable }),
    });
  },

  updateLocation(lat: number, lng: number, heading?: number) {
    return request('/cooks/location', {
      method: 'PUT',
      body: JSON.stringify({ lat, lng, heading }),
    });
  },
};

// ─── Health check ────────────────────────────────────────────────────

export const healthApi = {
  check() {
    return request<{ status: string; timestamp: string }>('/health');
  },
};

// ─── Types ───────────────────────────────────────────────────────────

export interface Address {
  id: string;
  userId: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  isDefault: boolean;
}

export interface CookProfile {
  id: string;
  userId: string;
  bio: string | null;
  specialties: string[];
  yearsOfExperience: number;
  rating: number;
  totalSessions: number;
  isAvailable: boolean;
  isVerified: boolean;
  isOnboarded: boolean;
  hourlyRate: number;
}

export interface Order {
  id: string;
  customerId: string;
  cookId: string | null;
  addressId: string;
  serviceDuration: number;
  scheduledAt: string;
  status: string;
  totalAmount: number;
  serviceCharge: number;
  taxAmount: number;
  discountAmount: number;
  specialInstructions: string | null;
  menuItems: unknown;
  cookingStartedAt: string | null;
  cookingEndedAt: string | null;
  cancelReason: string | null;
  customer?: { id: string; name: string | null; phone: string; avatarUrl: string | null };
  cook?: {
    id: string;
    name: string | null;
    phone: string;
    avatarUrl: string | null;
    cookProfile?: { rating: number; yearsOfExperience: number; totalSessions: number };
  } | null;
  address?: Address;
  payment?: { status: string; amount: number };
  review?: Review | null;
}

export interface Review {
  id: string;
  orderId: string;
  customerId: string;
  cookId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer?: { id: string; name: string | null; avatarUrl: string | null };
}
