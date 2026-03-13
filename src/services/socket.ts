import { io, Socket } from 'socket.io-client';
import { getToken } from './api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

let socket: Socket | null = null;

export function connectSocket(): Socket {
  if (socket?.connected) return socket;

  const token = getToken();
  if (!token) {
    throw new Error('Cannot connect socket without auth token');
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket!.id);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('error', (err: { event: string; message: string }) => {
    console.error(`Socket error [${err.event}]:`, err.message);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}

// ─── Event helpers ───────────────────────────────────────────────────

export function onOrderAccepted(
  callback: (data: { orderId: string; cook: unknown }) => void
) {
  socket?.on('order_accepted', callback);
  return () => socket?.off('order_accepted', callback);
}

export function onOrderRequest(
  callback: (data: {
    orderId: string;
    distance: number;
    serviceDuration: number;
    totalAmount: number;
    address: string;
    menuItems: unknown;
  }) => void
) {
  socket?.on('order_request', callback);
  return () => socket?.off('order_request', callback);
}

export function onCookLocationUpdate(
  callback: (data: {
    orderId: string;
    lat: number;
    lng: number;
    heading?: number;
    updatedAt: string;
  }) => void
) {
  socket?.on('cook_location_update', callback);
  return () => socket?.off('cook_location_update', callback);
}

export function onSessionStarted(
  callback: (data: { orderId: string; startedAt: string }) => void
) {
  socket?.on('session_started', callback);
  return () => socket?.off('session_started', callback);
}

export function onSessionCompleted(
  callback: (data: { orderId: string; endedAt: string }) => void
) {
  socket?.on('session_completed', callback);
  return () => socket?.off('session_completed', callback);
}

export function onOrderStatusUpdate(
  callback: (data: { orderId: string; status: string; cooksNotified?: number }) => void
) {
  socket?.on('order_status_update', callback);
  return () => socket?.off('order_status_update', callback);
}

export function onOrderCancelled(
  callback: (data: { orderId: string; reason: string }) => void
) {
  socket?.on('order_cancelled', callback);
  return () => socket?.off('order_cancelled', callback);
}

// ─── Emit helpers ────────────────────────────────────────────────────

export function emitCookLocationUpdate(data: {
  lat: number;
  lng: number;
  heading?: number;
  orderId?: string;
}) {
  socket?.emit('cook_location_update', data);
}

export function emitAcceptOrder(orderId: string) {
  socket?.emit('order_accepted', { orderId });
}

export function emitSessionStarted(orderId: string) {
  socket?.emit('session_started', { orderId });
}

export function emitSessionCompleted(orderId: string) {
  socket?.emit('session_completed', { orderId });
}

export function joinOrderRoom(orderId: string) {
  socket?.emit('join_order', { orderId });
}

export function leaveOrderRoom(orderId: string) {
  socket?.emit('leave_order', { orderId });
}
