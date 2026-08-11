import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.BACKEND_URL || 'http://localhost:8000';

const socket = io(SOCKET_URL, {
  withCredentials: true, // Required to send cookies along with the WebSocket handshake
  autoConnect: true,
});

export default socket;