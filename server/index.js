const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const RoomManager = require('./RoomManager');

// 1. Initialize Express and Middleware
const app = express();

// Allow cross-origin requests from your Vite frontend (port 5173)
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"]
}));

// 2. Create the HTTP Server
const server = http.createServer(app);

// 3. Initialize Socket.io with specific settings for WebRTC
const io = new Server(server, {
    cors: {
        origin: "*", // Allows any origin for development; tighten this for production
        methods: ["GET", "POST"]
    },
    // Using websocket transport is more stable for WebRTC signaling
    transports: ['websocket', 'polling'] 
});

// 4. Basic Health Check Route
app.get('/', (req, res) => {
    res.send('Morallive Signaling Server is running.');
});

// 5. Room Creation Helper (Optional API endpoint)
app.get('/create-room', (req, res) => {
    const { v4: uuidv4 } = require('uuid');
    res.json({ roomId: uuidv4() });
});

// 6. Socket connection handling
io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    // Pass the socket and the io instance to your RoomManager logic
    RoomManager(socket, io);
});

// 7. Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log('-------------------------------------------');
    console.log(`🚀 Morallive server running on port ${PORT}`);
    console.log(`🔗 Local: http://localhost:${PORT}`);
    console.log('-------------------------------------------');
});