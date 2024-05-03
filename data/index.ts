
import io from 'socket.io-client';
export const token=""

const headers = {
  "x-wp-token": token,
};

export const socket = io('http://192.168.1.18:3000',{
  extraHeaders:headers
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

