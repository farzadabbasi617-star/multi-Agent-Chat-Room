// =============================================
// Arena Chat - Real-time Client (100% Ready)
// Connected to Neon Postgres via Render
// =============================================

let socket = null;
let isConnected = false;

const LOCAL_SERVER = 'http://localhost:3001';

// =============================================
// ⚠️ FINAL STEP TO ACTIVATE REAL CHAT
// =============================================
// 1. Deploy the "backend" folder on https://render.com
// 2. After deployment, copy the URL (it looks like https://xxx.onrender.com)
// 3. Replace ONLY the line below with your real URL
//
// Example after you deploy:
// const PRODUCTION_SERVER = 'https://arena-chat-backend-abc123.onrender.com';

const PRODUCTION_SERVER = 'https://multi-agent-chat-room.onrender.com';   // ← Connected to your deployed backend

function getServerUrl() {
    const isLocal = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';
    return isLocal ? LOCAL_SERVER : PRODUCTION_SERVER;
}

function connectToServer(serverUrl = null) {
    const url = serverUrl || getServerUrl();
    if (socket) socket.disconnect();
    console.log('🔌 Connecting to:', url);

    if (typeof io === 'undefined') {
        const s = document.createElement('script');
        s.src = `${url}/socket.io/socket.io.js`;
        s.onload = () => initSocket(url);
        s.onerror = () => { window.useSimulationMode = true; showConnectionStatus(false); };
        document.head.appendChild(s);
    } else {
        initSocket(url);
    }
}

function initSocket(serverUrl) {
    socket = io(serverUrl, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
        isConnected = true;
        showConnectionStatus(true);
        const room = window.ChatData.currentRoom;
        const user = window.ChatData.currentUser;
        socket.emit('join', { user, roomId: room });
    });

    socket.on('disconnect', () => { isConnected = false; showConnectionStatus(false); });

    socket.on('room-joined', (data) => {
        if (window.ChatData.rooms[data.roomId]) 
            window.ChatData.rooms[data.roomId].messages = data.messages || [];
        if (window.ChatUI) window.ChatUI.renderMessages();
        const c = document.getElementById('room-online-count');
        if (c) c.innerText = data.onlineUsers?.length || 0;
    });

    socket.on('new-message', (msg) => {
        const r = window.ChatData.currentRoom;
        if (!window.ChatData.rooms[r]) window.ChatData.rooms[r] = { messages: [] };
        if (!window.ChatData.rooms[r].messages.some(m => m.id === msg.id)) {
            window.ChatData.rooms[r].messages.push(msg);
            window.ChatData.saveToStorage();
            if (window.ChatUI) window.ChatUI.renderMessages();
        }
    });

    socket.on('online-count', (count) => {
        const el = document.getElementById('room-online-count');
        if (el) el.innerText = count;
    });

    socket.on('user-typing', (u) => {
        if (u.userId !== window.ChatData.currentUser.id) showRemoteTypingIndicator(u);
    });
    socket.on('user-stop-typing', () => {
        const t = document.getElementById('typing-indicator');
        if (t) t.remove();
    });
}

function showConnectionStatus(connected) {
    let el = document.getElementById('connection-status');
    if (!el) {
        const h = document.querySelector('.chat-header');
        if (!h) return;
        el = document.createElement('div');
        el.id = 'connection-status';
        h.appendChild(el);
    }
    el.className = `ml-3 px-2.5 py-1 text-xs rounded-2xl flex items-center gap-1.5 ${connected ? 'bg-emerald-800 text-emerald-300' : 'bg-amber-800 text-amber-300'}`;
    el.innerHTML = `<i class="fa-solid ${connected ? 'fa-circle' : 'fa-plug'} text-xs"></i><span class="text-[10px]">${connected ? 'متصل به سرور واقعی' : 'حالت شبیه‌سازی'}</span>`;
}

function showRemoteTypingIndicator(user) {
    const c = document.getElementById('messages-container');
    if (!c) return;
    const old = document.getElementById('typing-indicator'); if (old) old.remove();
    const d = document.createElement('div');
    d.id = 'typing-indicator';
    d.className = 'flex gap-x-2 px-1';
    d.innerHTML = `<div class="flex-shrink-0"><img src="${user.avatar}" class="w-8 h-8 rounded-2xl ring-1 ring-slate-700"></div><div><div class="flex items-center gap-x-1.5 px-4 py-[9.5px]"><div class="flex items-center gap-x-1 bg-slate-700 px-4 py-[5.5px] rounded-3xl"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div></div><div class="px-2 text-xs text-slate-400">${user.userName} در حال تایپ...</div></div>`;
    c.appendChild(d);
    c.scrollTop = c.scrollHeight;
    setTimeout(() => d.remove(), 4000);
}

function sendRealMessage(roomId, text) {
    if (!socket || !isConnected) return false;
    socket.emit('send-message', { roomId, message: { text } });
    return true;
}

window.ChatSocket = {
    sendRealMessage,
    isConnected: () => isConnected,
    autoConnect: () => connectToServer()
};

window.addEventListener('load', () => {
    setTimeout(() => {
        if (!window.useSimulationMode) connectToServer();
    }, 800);
});
