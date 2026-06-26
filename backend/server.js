require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const db = require('./db');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// In-memory state (for real-time only)
let connectedUsers = new Map(); // socket.id -> user info
let roomUsers = {};             // roomId -> array of users

// Initialize database on startup
db.initDatabase().then(() => {
    console.log('✅ Database ready');
}).catch(err => {
    console.error('Database init failed:', err);
});

// REST API
app.get('/api/rooms', async (req, res) => {
    try {
        const rooms = await db.getRooms();
        const roomsWithOnline = rooms.map(room => ({
            id: room.id,
            name: room.name,
            online: roomUsers[room.id] ? roomUsers[room.id].length : 0
        }));
        res.json(roomsWithOnline);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
});

app.get('/api/room/:roomId', async (req, res) => {
    try {
        const messages = await db.getMessages(req.params.roomId);
        const online = roomUsers[req.params.roomId] ? roomUsers[req.params.roomId].length : 0;
        res.json({ messages, online });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch room' });
    }
});

// Socket.io
io.on('connection', (socket) => {
    console.log(`✅ کاربر متصل شد: ${socket.id}`);

    // Join room
    socket.on('join', async ({ user, roomId = 'general' }) => {
        const userInfo = {
            id: user.id || socket.id,
            name: user.name || 'ناشناس',
            avatar: user.avatar || 'https://i.pravatar.cc/36?img=47',
            socketId: socket.id
        };

        connectedUsers.set(socket.id, userInfo);

        // Join socket room
        socket.join(roomId);

        // Track online users
        if (!roomUsers[roomId]) roomUsers[roomId] = [];
        roomUsers[roomId] = roomUsers[roomId].filter(u => u.socketId !== socket.id);
        roomUsers[roomId].push(userInfo);

        // Load messages from Neon
        let messages = [];
        try {
            messages = await db.getMessages(roomId);
        } catch (e) {
            console.error('Error loading messages from DB:', e);
        }

        // Send room data to user
        socket.emit('room-joined', {
            roomId,
            roomName: roomId === 'general' ? 'عمومی' : roomId,
            messages,
            onlineUsers: roomUsers[roomId]
        });

        // Notify others
        socket.to(roomId).emit('user-joined', {
            user: userInfo,
            onlineCount: roomUsers[roomId].length
        });

        io.to(roomId).emit('online-count', roomUsers[roomId].length);

        console.log(`👤 ${userInfo.name} وارد اتاق ${roomId} شد`);
    });

    // Send message (NOW SAVES TO NEON)
    socket.on('send-message', async ({ roomId, message }) => {
        const user = connectedUsers.get(socket.id);
        if (!user) return;

        const fullMessage = {
            id: Date.now(),
            roomId,
            userId: user.id,
            userName: user.name,
            avatar: user.avatar,
            text: message.text,
            time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now()
        };

        try {
            // Save to Neon Postgres
            await db.saveMessage(fullMessage);
        } catch (err) {
            console.error('Failed to save message to Neon:', err);
        }

        // Broadcast to everyone in the room
        io.to(roomId).emit('new-message', fullMessage);
    });

    // Typing indicators
    socket.on('typing', ({ roomId }) => {
        const user = connectedUsers.get(socket.id);
        if (user) {
            socket.to(roomId).emit('user-typing', {
                userId: user.id,
                userName: user.name,
                avatar: user.avatar
            });
        }
    });

    socket.on('stop-typing', ({ roomId }) => {
        const user = connectedUsers.get(socket.id);
        if (user) {
            socket.to(roomId).emit('user-stop-typing', { userId: user.id });
        }
    });

    // Switch room
    socket.on('switch-room', async ({ fromRoom, toRoom, user }) => {
        if (fromRoom) {
            socket.leave(fromRoom);
            if (roomUsers[fromRoom]) {
                roomUsers[fromRoom] = roomUsers[fromRoom].filter(u => u.socketId !== socket.id);
                io.to(fromRoom).emit('online-count', roomUsers[fromRoom].length);
            }
        }

        socket.join(toRoom);

        if (!roomUsers[toRoom]) roomUsers[toRoom] = [];
        const userInfo = connectedUsers.get(socket.id);
        if (userInfo) {
            roomUsers[toRoom] = roomUsers[toRoom].filter(u => u.socketId !== socket.id);
            roomUsers[toRoom].push(userInfo);
        }

        let messages = [];
        try {
            messages = await db.getMessages(toRoom);
        } catch (e) {}

        socket.emit('room-joined', {
            roomId: toRoom,
            roomName: toRoom,
            messages,
            onlineUsers: roomUsers[toRoom]
        });

        io.to(toRoom).emit('online-count', roomUsers[toRoom].length);
    });

    // Create new room
    socket.on('create-room', async ({ roomName }) => {
        const roomId = 'room-' + Date.now();

        try {
            await db.createRoom(roomId, roomName);
        } catch (e) {
            console.error('Failed to create room in DB:', e);
        }

        socket.emit('room-created', { roomId, roomName });
        io.emit('rooms-updated');
    });

    // Disconnect
    socket.on('disconnect', () => {
        const user = connectedUsers.get(socket.id);
        if (user) {
            Object.keys(roomUsers).forEach(roomId => {
                roomUsers[roomId] = roomUsers[roomId].filter(u => u.socketId !== socket.id);
                io.to(roomId).emit('user-left', {
                    userId: user.id,
                    userName: user.name
                });
                io.to(roomId).emit('online-count', roomUsers[roomId].length);
            });

            console.log(`❌ ${user.name} قطع اتصال شد`);
            connectedUsers.delete(socket.id);
        }
    });
});

// Start server
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`🚀 سرور چت Arena روی پورت ${PORT} اجرا شد`);
    console.log(`📡 Socket.io + Neon Postgres آماده است`);
});

// Clean up memory periodically (not DB)
setInterval(() => {
    Object.keys(roomUsers).forEach(roomId => {
        if (roomUsers[roomId].length === 0) {
            delete roomUsers[roomId];
        }
    });
}, 1000 * 60 * 5);