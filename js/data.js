// Data management module
let currentRoom = 'general';
let currentUser = {
    id: 'you',
    name: 'شما',
    avatar: 'https://i.pravatar.cc/36?img=47'
};

let rooms = {
    'general': {
        id: 'general',
        name: 'عمومی',
        icon: 'fa-comments',
        iconColor: 'text-indigo-400',
        description: 'اتاق اصلی برای بحث‌های عمومی و گپ دوستانه',
        online: 128,
        messages: [
            {
                id: 1,
                userId: 'maryam',
                userName: 'مریم',
                avatar: 'https://i.pravatar.cc/36?img=28',
                text: 'سلام دوستان! امیدوارم همه حالشون خوب باشه 😊',
                time: '09:12',
                timestamp: Date.now() - 1000 * 60 * 45
            },
            {
                id: 2,
                userId: 'reza',
                userName: 'رضا',
                avatar: 'https://i.pravatar.cc/36?img=40',
                text: 'سلام مریم! امروز چه خبر؟',
                time: '09:15',
                timestamp: Date.now() - 1000 * 60 * 42
            },
            {
                id: 3,
                userId: 'you',
                userName: 'شما',
                avatar: 'https://i.pravatar.cc/36?img=47',
                text: 'سلام به همه! من امروز یه پروژه جدید شروع کردم.',
                time: '09:18',
                timestamp: Date.now() - 1000 * 60 * 38
            }
        ]
    },
    'tech': {
        id: 'tech',
        name: 'توسعه‌دهندگان',
        icon: 'fa-code',
        iconColor: 'text-sky-400',
        description: 'بحث‌های فنی، برنامه‌نویسی و تکنولوژی',
        online: 84,
        messages: [
            {
                id: 1,
                userId: 'reza',
                userName: 'رضا',
                avatar: 'https://i.pravatar.cc/36?img=40',
                text: 'کسی تجربه کار با Next.js 15 رو داره؟',
                time: '10:05',
                timestamp: Date.now() - 1000 * 60 * 55
            }
        ]
    },
    'gaming': {
        id: 'gaming',
        name: 'گیمرها',
        icon: 'fa-gamepad',
        iconColor: 'text-rose-400',
        description: 'گیمینگ، بازی‌های آنلاین و بحث‌های سرگرم‌کننده',
        online: 41,
        messages: []
    },
    'fun': {
        id: 'fun',
        name: 'سرگرمی',
        icon: 'fa-smile',
        iconColor: 'text-amber-300',
        description: 'جوک، میم و هر چیز سرگرم‌کننده',
        online: 97,
        messages: []
    }
};

let users = {
    'you': { id: 'you', name: 'شما', avatar: 'https://i.pravatar.cc/36?img=47', status: 'online' },
    'maryam': { id: 'maryam', name: 'مریم', avatar: 'https://i.pravatar.cc/36?img=28', status: 'online' },
    'reza': { id: 'reza', name: 'رضا', avatar: 'https://i.pravatar.cc/36?img=40', status: 'online' },
    'sara': { id: 'sara', name: 'سارا', avatar: 'https://i.pravatar.cc/36?img=32', status: 'online' },
    'amir': { id: 'amir', name: 'امیر', avatar: 'https://i.pravatar.cc/36?img=12', status: 'online' },
    'negari': { id: 'negari', name: 'نگار', avatar: 'https://i.pravatar.cc/36?img=64', status: 'away' }
};

// Load from localStorage
function loadFromStorage() {
    const savedRooms = localStorage.getItem('chatRooms');
    if (savedRooms) {
        rooms = JSON.parse(savedRooms);
    }
    
    const savedUser = localStorage.getItem('chatCurrentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
    
    Object.keys(rooms).forEach(key => {
        if (!rooms[key].messages) rooms[key].messages = [];
    });
}

// Save to localStorage
function saveToStorage() {
    localStorage.setItem('chatRooms', JSON.stringify(rooms));
    localStorage.setItem('chatCurrentUser', JSON.stringify(currentUser));
}

// Update current user
function updateCurrentUser(newUser) {
    currentUser = { ...currentUser, ...newUser };
    
    if (users['you']) {
        users['you'].name = currentUser.name;
        users['you'].avatar = currentUser.avatar;
    }
    
    saveToStorage();
}

// Add message to current room
function addMessageToRoom(roomId, message) {
    if (!rooms[roomId]) return null;
    
    rooms[roomId].messages.push(message);
    saveToStorage();
    return message;
}

// Get current room data
function getCurrentRoom() {
    return rooms[currentRoom];
}

// Switch room
function switchToRoom(roomKey) {
    if (!rooms[roomKey]) return false;
    currentRoom = roomKey;
    return true;
}

// Create new room
function createRoom(name) {
    const roomId = 'room-' + Date.now();
    
    rooms[roomId] = {
        id: roomId,
        name: name,
        icon: 'fa-hashtag',
        iconColor: 'text-teal-400',
        description: 'اتاق تازه ایجاد شده',
        online: Math.floor(Math.random() * 30) + 8,
        messages: []
    };
    
    // Welcome message
    const welcomeMsg = {
        id: Date.now(),
        userId: 'maryam',
        userName: 'مریم',
        avatar: 'https://i.pravatar.cc/36?img=28',
        text: `خوش اومدید به ${name}! 🎉`,
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
    };
    
    rooms[roomId].messages.push(welcomeMsg);
    saveToStorage();
    
    return roomId;
}

// Clear room messages
function clearRoomMessages(roomId) {
    if (rooms[roomId]) {
        rooms[roomId].messages = [];
        saveToStorage();
    }
}

// Get online users
function getOnlineUsers() {
    return Object.values(users).filter(u => u.status === 'online');
}

// Export for use in other modules
window.ChatData = {
    get currentRoom() { return currentRoom; },
    set currentRoom(val) { currentRoom = val; },
    get currentUser() { return currentUser; },
    get rooms() { return rooms; },
    get users() { return users; },
    loadFromStorage,
    saveToStorage,
    updateCurrentUser,
    addMessageToRoom,
    getCurrentRoom,
    switchToRoom,
    createRoom,
    clearRoomMessages,
    getOnlineUsers
};