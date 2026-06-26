// Main App Initialization
// This file glues all modules together

function initializeApp() {
    console.log('%c[Chat App] Initializing modular chat app...', 'color:#64748b');
    
    // Load persisted data
    if (window.ChatData && window.ChatData.loadFromStorage) {
        window.ChatData.loadFromStorage();
    }
    
    // Sync current user from data
    const currentUser = window.ChatData.currentUser;
    
    // Update UI elements with current user
    if (window.ChatUI && window.ChatUI.updateCurrentUserUI) {
        window.ChatUI.updateCurrentUserUI();
    }
    
    // Render initial UI
    if (window.ChatUI) {
        window.ChatUI.renderRoomsList();
        window.ChatUI.updateRoomHeader();
        window.ChatUI.renderMessages();
        window.ChatUI.renderOnlineUsers();
    }
    
    // Set up global event listeners
    setupEventListeners();
    
    // Add some realism features
    addRealismFeatures();
    
    // Welcome toast (only once)
    setTimeout(() => {
        if (!localStorage.getItem('chatWelcomed')) {
            if (window.ChatUI && window.ChatUI.showToast) {
                window.ChatUI.showToast('به چت روم واقعی خوش آمدید!');
            }
            localStorage.setItem('chatWelcomed', 'true');
        }
    }, 2700);
    
    // Keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Periodic updates for realism
    setupPeriodicUpdates();
    
    // Expose useful global API for debugging / advanced use
    window.ChatApp = {
        switchRoom: (roomKey) => {
            const oldRoom = window.ChatData.currentRoom;
            
            if (window.ChatData.switchToRoom(roomKey)) {
                if (window.ChatUI) {
                    window.ChatUI.updateRoomHeader();
                    window.ChatUI.renderRoomsList();
                    window.ChatUI.renderMessages();
                }
                
                // Real-time room switch
                if (window.ChatSocket && window.ChatSocket.switchRoomOnServer) {
                    window.ChatSocket.switchRoomOnServer(oldRoom, roomKey);
                }
            }
        },
        sendMessage: (text) => {
            if (window.ChatLogic && window.ChatLogic.sendMessage) {
                window.ChatLogic.sendMessage(text);
            }
        },
        getCurrentRoom: () => window.ChatData.getCurrentRoom(),
        getRooms: () => window.ChatData.rooms,
        clearAllData: () => {
            localStorage.removeItem('chatRooms');
            localStorage.removeItem('chatCurrentUser');
            location.reload();
        },
        connectToServer: () => {
            if (window.ChatSocket && window.ChatSocket.connectToServer) {
                window.ChatSocket.connectToServer('http://localhost:3001');
            }
        },
        disconnect: () => {
            if (window.ChatSocket && window.ChatSocket.disconnectFromServer) {
                window.ChatSocket.disconnectFromServer();
            }
        }
    };
    
    console.log('%c[Chat App] Modular chat app ready! Use window.ChatApp for advanced control.', 'color:#64748b');
}

function setupEventListeners() {
    // Message input Enter key (already handled inline in HTML, but we can enhance)
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        // Additional listener for better UX
        messageInput.addEventListener('input', () => {
            localStorage.setItem('lastUserAction', Date.now());
        });
        
        // Auto-focus on load
        setTimeout(() => {
            // messageInput.focus(); // optional
        }, 800);
    }
    
    // Search input enhancement
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            if (window.ChatUI && window.ChatUI.renderMessages) {
                window.ChatUI.renderMessages(this.value);
            }
        });
    }
    
    // Make sure modals close on escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close emoji picker
            const emojiPicker = document.getElementById('emoji-picker');
            if (emojiPicker && !emojiPicker.classList.contains('hidden')) {
                emojiPicker.classList.remove('flex');
                emojiPicker.classList.add('hidden');
                return;
            }
            
            // Close user settings
            const userModal = document.getElementById('user-settings-modal');
            if (userModal && userModal.classList.contains('flex')) {
                userModal.classList.remove('flex');
                userModal.classList.add('hidden');
            }
        }
    });
    
    // Prevent form submission issues
    document.addEventListener('submit', e => e.preventDefault());
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Cmd/Ctrl + / → focus message input
        if ((e.metaKey || e.ctrlKey) && e.key === '/') {
            e.preventDefault();
            const input = document.getElementById('message-input');
            if (input) input.focus();
        }
        
        // ? → focus search (when not typing)
        if (e.key === '?' && document.activeElement.id !== 'message-input') {
            e.preventDefault();
            const search = document.getElementById('search-input');
            if (search) search.focus();
        }
    });
}

function addRealismFeatures() {
    // Random background activity (simulated users typing occasionally)
    setInterval(() => {
        if (document.visibilityState === 'visible' && Math.random() < 0.15) {
            const room = window.ChatData.getCurrentRoom();
            
            if (room && room.messages.length > 0) {
                const lastMsg = room.messages[room.messages.length - 1];
                
                // Only simulate if user hasn't interacted recently
                const lastAction = parseInt(localStorage.getItem('lastUserAction') || '0');
                if (lastMsg && (Date.now() - lastMsg.timestamp > 1000 * 75) && 
                    (Date.now() - lastAction > 1000 * 60)) {
                    
                    const users = window.ChatData.users;
                    const currentUser = window.ChatData.currentUser;
                    const otherUsers = Object.keys(users).filter(id => id !== currentUser.id);
                    
                    if (otherUsers.length > 0) {
                        const randUser = users[otherUsers[Math.floor(Math.random() * otherUsers.length)]];
                        
                        const texts = ['آره دقیقاً!', 'خوبه', 'ممنون!', 'جالب بود', 'موافقم'];
                        const randomText = texts[Math.floor(Math.random() * texts.length)];
                        
                        const now = new Date();
                        const timeStr = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
                        
                        const msg = {
                            id: Date.now(),
                            userId: randUser.id,
                            userName: randUser.name,
                            avatar: randUser.avatar,
                            text: randomText,
                            time: timeStr,
                            timestamp: Date.now()
                        };
                        
                        window.ChatData.addMessageToRoom(window.ChatData.currentRoom, msg);
                        
                        if (window.ChatUI && window.ChatUI.renderMessages) {
                            window.ChatUI.renderMessages();
                        }
                    }
                }
            }
        }
    }, 120000); // every 2 minutes
    
    // Update online count occasionally for realism
    setInterval(() => {
        const room = window.ChatData.getCurrentRoom();
        if (room && document.visibilityState === 'visible') {
            const fluctuation = Math.random() > 0.6 ? 1 : -1;
            room.online = Math.max(15, Math.min(250, room.online + fluctuation));
            
            const countEl = document.getElementById('room-online-count');
            if (countEl) countEl.innerText = room.online;
            
            // Also update rooms list occasionally
            if (window.ChatUI && window.ChatUI.renderRoomsList && Math.random() > 0.6) {
                window.ChatUI.renderRoomsList();
            }
        }
    }, 38000);
}

function setupPeriodicUpdates() {
    // Make sure data is saved before user leaves
    window.addEventListener('beforeunload', () => {
        if (window.ChatData && window.ChatData.saveToStorage) {
            window.ChatData.saveToStorage();
        }
    });
    
    // Optional: sync user status
    setTimeout(() => {
        const users = window.ChatData.users;
        if (users && users['you']) {
            // Ensure current user is always online
            users['you'].status = 'online';
        }
    }, 1000);
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

// Also start if already loaded
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    setTimeout(initializeApp, 50);
}