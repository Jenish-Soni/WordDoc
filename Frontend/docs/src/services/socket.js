import io from 'socket.io-client';

let socket = null;

export const  initializeSocket = (token) => {
  if (socket) return socket;
  
  if (!token) {
    console.error('No token provided for socket connection');
    return null;
  }

  console.log('Initializing socket with token:', token); // Debug log

  socket = io('http://localhost:5000', {
    auth: { token }, // Pass the token in auth object
    withCredentials: true,
    transports: ['polling', 'websocket'],
    path: '/socket.io',
  });

  socket.on('connect', () => {
    console.log('Socket connected successfully');
  });

  socket.on('connect_error', (error) => {
    console.log('Connection error details:', {
      message: error.message,
      description: error.description,
      data: error.data
    });
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
