// Real-time Socket.io Client for Arena Chat
// Supports both local development and production (Render + Neon)

let socket = null;
let isConnected = false;

const LOCAL_SERVER = 'http://localhost:3001';
// 👇 CHANGE THIS AFTER DEPLOYING ON RENDER
// Example: https://arena-chat-backend.onrender.com
const PRODUCTION_SERVER = 'https://YOUR-RENDER-APP-NAME.onrender.com';

function getServerUrl() {
    const isLocal = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname.includes('127.0.0.1');
    return isLocal ? LOCAL_SERVER : PRODUCTION_SERVER;
}

function connectToServer(serverUrl = null) {
    const url = serverUrl || getServerUrl();

    if (socket) socket.disconnect();

    if (typeof io === 'undefined') {
        const script = document.createElement('script');
        script.src = `${url}/socket.io/socket.io.js`;
        script.onload = () => initSocket(url);
        script.onerror = () => {
            console.warn('⚠️ Could not connect to real server. Using simulation mode.');
            window.useSimulationMode = true;
            showConnectionStatus(false);
        };
        document.head.appendChild(script);
    } else {
        initSocket(url);
    }
}

function initSocket(serverUrl) {
    socket = io(serverUrl, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
        console.log('✅ Connected to real server:', serverUrl);
        isConnected = true;
        showConnectionStatus(true);

        const currentRoom = window.ChatData.currentRoom;
        const currentUser = window.ChatData.currentUser;

        socket.emit('join', { user: currentUser, roomId: currentRoom });
    });

    socket.on('disconnect', () => {
        isConnected = false;
        showConnectionStatus(false);
    });

    socket.on('connect_error', () => {
        isConnected = false;
        window.useSimulationMode = true;
        showConnectionStatus(false);
    });

    // === Real-time events from server ===
    socket.on('room-joined', (data) => {
        const room = window.ChatData.rooms[data.roomId];
        if (room) room.messages = data.messages || [];
        if (window.ChatUI) {
            window.ChatUI.renderMessages();
        }
        const countEl = document.getElementById('room-online-count');
        if (countEl && data.onlineUsers) countEl.innerText = data.onlineUsers.length;
    });

    socket.on('new-message', (message) => {
        const roomId = window.ChatData.currentRoom;
        const exists = window.ChatData.rooms[roomId]?.messages.some(m => m.id === message.id);
        if (!exists) {
            window.ChatData.rooms[roomId].messages.push(message);
            window.ChatData.saveToStorage();
            if (window.ChatUI) window.ChatUI.renderMessages();
        }
    });

    socket.on('user-joined', (data) => {
        if (window.ChatUI?.showToast) window.ChatUI.showToast(`${data.user.name} وارد شد`);
    });

    socket.on('user-left', (data) => {
        if (window.ChatUI?.showToast) window.ChatUI.showToast(`${data.userName} خارج شد`);
    });

    socket.on('online-count', (count) => {
        const el = document.getElementById('room-online-count');
        if (el) el.innerText = count;
    });

    socket.on('user-typing', (data) => {
        if (data.userId !== window.ChatData.currentUser.id) {
            showRemoteTypingIndicator(data);
        }
    });

    socket.on('user-stop-typing', () => {
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
    });

    socket.on('room-created', () => {
        if (window.ChatUI) window.ChatUI.renderRoomsList();
    });
}

function showConnectionStatus(connected) {
    let statusEl = document.getElementById('connection-status');
    if (!statusEl) {
        const header = document.querySelector('.chat-header');
        if (!header) return;
        statusEl = document.createElement('div');
        statusEl.id = 'connection-status';
        header.appendChild(statusEl);
    }
    
    statusEl.className = `ml-3 px-2.5 py-1 text-xs rounded-xl flex items-center gap-1.5 transition-all ${
        connected 
            ? 'bg-emerald-800 text-emerald-300' 
            : 'bg-amber-800 text-amber-300'
    }`;
    
    statusEl.innerHTML = `
        <i class="fa-solid ${connected ? 'fa-circle' : 'fa-plug'} text-xs"></i>
        <span class="text-[10px] font-medium">${connected ? 'متصل به سرور' : 'حالت شبیه‌سازی'}</span>
    `;
}

function showRemoteTypingIndicator(user) {
    const container = document.getElementById('messages-container');
    if (!container) return;

    const existing = document.getElementById('typing-indicator');
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.id = 'typing-indicator';
    div.className = `flex gap-x-2 px-1`;
    div.innerHTML = `
        <div class="flex-shrink-0">
            <img src="${user.avatar}" class="w-8 h-8 rounded-2xl ring-1 ring-slate-700">
        </div>
        <div>
            <div class="flex items-center gap-x-1.5 px-4 py-[9.5px]">
                <div class="flex items-center gap-x-1 bg-slate-700 px-4 py-[5.5px] rounded-3xl">
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
            <div class="px-2 text-xs text-slate-400">${user.userName} در حال تایپ...</div>
        </div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;

    setTimeout(() => div.remove(), 4000);
}

// === Public API ===
function sendRealMessage(roomId, text) {
    if (!socket || !isConnected) return false;
    socket.emit('send-message', { roomId, message: { text } });
    return true;
}

function switchRoomOnServer(fromRoom, toRoom) {
    if (!socket || !isConnected) return false;
    socket.emit('switch-room', { fromRoom, toRoom, user: window.ChatData.currentUser });
    return true;
}

function createRoomOnServer(roomName) {
    if (!socket || !isConnected) return false;
    socket.emit('create-room', { roomName });
    return true;
}

function sendTypingIndicator(roomId) {
    if (socket && isConnected) socket.emit('typing', { roomId });
}

function disconnectFromServer() {
    if (socket) socket.disconnect();
}

function autoConnect() {
    const url = getServerUrl();
    console.log('🔌 Auto-connecting to:', url);
    connectToServer(url);
}

// Expose
window.ChatSocket = {
    connectToServer,
    disconnectFromServer,
    sendRealMessage,
    switchRoomOnServer,
    createRoomOnServer,
    sendTypingIndicator,
    isConnected: () => isConnected,
    autoConnect
};

// Auto start
window.addEventListener('load', () => {
    setTimeout(() => {
        if (!window.useSimulationMode) {
            window.ChatSocket.autoConnect();
        }
    }, 1000);
});