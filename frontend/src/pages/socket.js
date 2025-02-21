import { io } from 'socket.io-client';

const socket = io('http://localhost:5001'); // Adjust if backend runs on a different host

export default socket;
