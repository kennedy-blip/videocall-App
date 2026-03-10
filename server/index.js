const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const RoomManager = require('./RoomManager');

// 1. Initialize Express
const app = express();

// 2. Configure Middleware
app.use(cors({
    origin: "*", // Allows your Render frontend to talk to this backend
    methods: ["GET", "POST"]
}));

// 3. Create HTTP Server
const server = http.createServer(app);

// 4. Initialize Socket.io (Declared ONLY ONCE)
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
});

// 5. API Routes
app.get('/', (req, res) => {
    res.send('Morallive Signaling Server is Live.');
});

// This matches the fetch in your LandingPage.jsx
app.get('/create-room', (req, res) => {
    const roomId = uuidv4();
    console.log(`Room Created: ${roomId}`);
    res.json({ roomId });
});

// 6. Socket connection handling
io.on('connection', (socket) => {
    // Pass the socket to your RoomManager logic
    RoomManager(socket, io);
});

// 7. Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log('-------------------------------------------');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 Backend URL: https://videocall-app-qpie.onrender.com`);
    console.log('-------------------------------------------');
});