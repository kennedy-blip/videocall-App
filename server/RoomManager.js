// This tracks which users are in which rooms
// Structure: { roomId: [socketId1, socketId2, ...] }
const rooms = {};

// This tracks mapping of socketId to userName for chat display
const socketToName = {};

const RoomManager = (socket, io) => {
    
    // --- 1. JOIN ROOM LOGIC ---
    socket.on('join-room', ({ roomId, userName }) => {
        if (rooms[roomId]) {
            const length = rooms[roomId].length;
            if (length >= 6) {
                socket.emit('room-full');
                return;
            }
            rooms[roomId].push(socket.id);
        } else {
            rooms[roomId] = [socket.id];
        }
        
        socketToName[socket.id] = userName;
        socket.join(roomId);

        // Tell the new user who else is already in the room
        const otherUsers = rooms[roomId].filter(id => id !== socket.id);
        socket.emit('all-users', otherUsers);
        
        console.log(`User ${userName} (${socket.id}) joined room: ${roomId}`);
    });

    // --- 2. WEBRTC SIGNALING HANDSHAKES ---
    socket.on('sending-signal', payload => {
        io.to(payload.userToSignal).emit('user-joined', { 
            signal: payload.signal, 
            callerID: payload.callerID,
            userName: socketToName[socket.id]
        });
    });

    socket.on('returning-signal', payload => {
        io.to(payload.callerID).emit('receiving-returned-signal', { 
            signal: payload.signal, 
            id: socket.id 
        });
    });

    // --- 3. CHAT LOGIC ---
    socket.on('send-message', ({ roomId, message, userName }) => {
        console.log(`[Chat] ${userName} in ${roomId}: ${message}`);
        
        // Broadcast message to everyone in the room
        io.to(roomId).emit('receive-message', {
            id: Date.now(),
            text: message,
            sender: userName,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    });

    // --- 4. DISCONNECT LOGIC ---
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        // Remove user from the room tracking
        for (const roomId in rooms) {
            rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
            if (rooms[roomId].length === 0) delete rooms[roomId];
            
            // Inform others in the room
            socket.to(roomId).emit('user-left', socket.id);
        }
        delete socketToName[socket.id];
    });
};

module.exports = RoomManager;