// UI module - handles all rendering and DOM interactions

// Render rooms list
function renderRoomsList() {
    const container = document.getElementById('rooms-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    const rooms = window.ChatData.rooms;
    const currentRoom = window.ChatData.currentRoom;
    
    Object.keys(rooms).forEach(roomKey => {
        const room = rooms[roomKey];
        const isActive = roomKey === currentRoom;
        
        const div = document.createElement('div');
        div.className = `room-item flex items-center gap-x-3 px-3 py-[9.5px] mx-1 rounded-2xl cursor-pointer mb-0.5 ${isActive ? 'active' : ''}`;
        
        div.innerHTML = `
            <div class="w-8 h-8 flex-shrink-0 rounded-xl flex items-center justify-center bg-slate-800">
                <i class="fa-solid ${room.icon} ${room.iconColor} text-lg"></i>
            </div>
            
            <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                    <span class="font-semibold text-sm">${room.name}</span>
                    <div class="flex items-center">
                        <span class="text-emerald-300 font-medium text-xs">${room.online}</span>
                    </div>
                </div>
            </div>
        `;
        
        div.onclick = () => {
            if (window.ChatData.switchToRoom(roomKey)) {
                updateRoomHeader();
                renderRoomsList();
                renderMessages();
                document.getElementById('room-online-count').innerText = room.online;
            }
        };
        
        container.appendChild(div);
    });
}

// Render online users
function renderOnlineUsers() {
    const container = document.getElementById('online-users-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    const onlineUsers = window.ChatData.getOnlineUsers();
    const currentUser = window.ChatData.currentUser;
    
    document.getElementById('online-count-text').innerHTML = `${onlineUsers.length} نفر`;
    
    onlineUsers.forEach(user => {
        const isCurrent = user.id === currentUser.id;
        
        const div = document.createElement('div');
        div.className = `user-item flex items-center gap-x-2.5 px-3 py-[6.5px] rounded-2xl mb-1 cursor-pointer ${isCurrent ? 'bg-slate-800' : ''}`;
        
        let statusHTML = user.status === 'online' 
            ? `<div class="w-2.5 h-2.5 bg-emerald-400 rounded-full status-dot"></div>` 
            : `<div class="w-2.5 h-2.5 bg-amber-300 rounded-full status-dot"></div>`;
        
        div.innerHTML = `
            <div class="relative flex-shrink-0">
                <img src="${user.avatar}" class="w-8 h-8 rounded-2xl ring-1 ring-slate-700" alt="${user.name}">
                <div class="absolute -bottom-0.5 -right-0.5">
                    ${statusHTML}
                </div>
            </div>
            
            <div class="flex-1 min-w-0">
                <div class="flex items-center">
                    <span class="text-sm font-medium truncate">${user.name}</span>
                    ${isCurrent ? `<span class="ml-1.5 px-1.5 py-0 text-[9px] bg-emerald-800 text-emerald-300 rounded-md font-bold" style="font-size: 8.5px">تو</span>` : ''}
                </div>
            </div>
        `;
        
        if (!isCurrent) {
            div.onclick = () => {
                if (window.ChatLogic && window.ChatLogic.simulateMessageFromUser) {
                    window.ChatLogic.simulateMessageFromUser(user.id);
                }
            };
            div.title = `ارسال پیام از طرف ${user.name}`;
        } else {
            div.onclick = () => showUserSettings();
        }
        
        container.appendChild(div);
    });
    
    // Offline user for realism
    const offlineUser = Object.values(window.ChatData.users).find(u => u.status === 'away');
    if (offlineUser) {
        const div = document.createElement('div');
        div.className = `user-item flex items-center gap-x-2.5 px-3 py-[6.5px] rounded-2xl mb-1 opacity-70`;
        
        div.innerHTML = `
            <div class="relative flex-shrink-0">
                <img src="${offlineUser.avatar}" class="w-8 h-8 rounded-2xl ring-1 ring-slate-700" alt="${offlineUser.name}">
                <div class="absolute -bottom-0.5 -right-0.5">
                    <div class="w-2.5 h-2.5 bg-slate-400 rounded-full status-dot"></div>
                </div>
            </div>
            
            <div class="flex-1">
                <span class="text-sm font-medium truncate">${offlineUser.name}</span>
            </div>
        `;
        
        container.appendChild(div);
    }
}

// Render messages
function renderMessages(filterText = '') {
    const container = document.getElementById('messages-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const room = window.ChatData.getCurrentRoom();
    if (!room || !room.messages) return;
    
    let messagesToShow = [...room.messages];
    
    if (filterText) {
        const lowerFilter = filterText.toLowerCase();
        messagesToShow = messagesToShow.filter(msg => 
            msg.text.toLowerCase().includes(lowerFilter) || 
            msg.userName.toLowerCase().includes(lowerFilter)
        );
    }
    
    messagesToShow.sort((a, b) => a.timestamp - b.timestamp);
    
    if (messagesToShow.length === 0) {
        const empty = document.createElement('div');
        empty.className = `flex flex-col items-center justify-center h-full py-10 text-center`;
        empty.innerHTML = `
            <i class="fa-solid fa-comments text-4xl text-slate-700 mb-3"></i>
            <p class="text-slate-400">هیچ پیامی پیدا نشد.</p>
        `;
        container.appendChild(empty);
        return;
    }
    
    const currentUser = window.ChatData.currentUser;
    
    messagesToShow.forEach(msg => {
        const isOwn = msg.userId === currentUser.id || msg.userName === currentUser.name;
        
        const msgDiv = document.createElement('div');
        msgDiv.className = `flex message-container ${isOwn ? 'justify-end' : 'justify-start'} group`;
        msgDiv.dataset.messageId = msg.id;
        
        let html = '';
        
        if (isOwn) {
            html = `
                <div class="max-w-[72%] flex flex-col items-end">
                    <div class="flex items-center gap-x-[6px]">
                        <div class="msg-actions flex items-center gap-x-1 opacity-0 group-hover:opacity-100">
                            <button onclick="editMessage(${msg.id})" class="px-1.5 py-1 text-xs text-indigo-300 hover:text-indigo-200">
                                <i class="fa-solid fa-edit text-xs"></i>
                            </button>
                            <button onclick="deleteMessage(${msg.id})" class="px-1.5 py-1 text-xs text-rose-300 hover:text-rose-200">
                                <i class="fa-solid fa-trash text-xs"></i>
                            </button>
                        </div>
                        
                        <div class="flex items-center gap-x-2">
                            <div>
                                <div class="message-bubble own-message px-4 py-[9.5px]">
                                    <div class="realistic-message text-[14.5px] leading-relaxed">${msg.text}</div>
                                </div>
                                
                                <div class="flex items-center justify-end gap-x-2 mt-1 px-1">
                                    <span class="message-time text-indigo-200">${msg.time}</span>
                                    <div class="flex items-center -space-x-0.5">
                                        <i class="fa-solid fa-check text-indigo-200 text-xs"></i>
                                        <i class="fa-solid fa-check text-indigo-200 text-xs -ml-1"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            html = `
                <div class="flex gap-x-2 max-w-[72%]">
                    <div class="flex-shrink-0 mt-1">
                        <img src="${msg.avatar}" class="w-8 h-8 rounded-2xl ring-1 ring-slate-700 chat-avatar" alt="${msg.userName}">
                    </div>
                    
                    <div>
                        <div class="flex items-baseline gap-x-2 mb-[1px]">
                            <span class="font-semibold text-sm text-white">${msg.userName}</span>
                            <span class="message-time text-slate-400">${msg.time}</span>
                        </div>
                        
                        <div class="flex items-center gap-x-2">
                            <div class="message-bubble other-message px-4 py-[9.5px]">
                                <div class="realistic-message text-[14.5px] leading-relaxed">${msg.text}</div>
                            </div>
                            
                            <div class="msg-actions flex items-center gap-x-1 opacity-0 group-hover:opacity-100">
                                <button onclick="replyToMessage(${msg.id})" class="px-1 py-1 text-xs text-slate-300 hover:text-slate-100">
                                    <i class="fa-solid fa-reply text-xs"></i>
                                </button>
                                
                                <button onclick="reactToMessage(${msg.id}, '❤️')" class="px-1 py-1 text-xs text-slate-300 hover:text-rose-300">
                                    <i class="fa-solid fa-heart text-xs"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        msgDiv.innerHTML = html;
        container.appendChild(msgDiv);
    });
    
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 10);
}

// Update room header
function updateRoomHeader() {
    const room = window.ChatData.getCurrentRoom();
    if (!room) return;
    
    const iconEl = document.getElementById('room-icon');
    if (iconEl) {
        iconEl.innerHTML = `<i class="fa-solid ${room.icon} text-2xl ${room.iconColor}"></i>`;
        iconEl.style.background = '#1e2937';
    }
    
    const nameEl = document.getElementById('room-name');
    if (nameEl) nameEl.innerText = room.name;
    
    const descEl = document.getElementById('room-description');
    if (descEl) descEl.innerText = room.description;
    
    const onlineEl = document.getElementById('room-online-count');
    if (onlineEl) onlineEl.innerText = room.online;
}

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 left-4 bg-slate-800 border border-slate-700 shadow-2xl px-4 py-[9px] rounded-3xl flex items-center gap-x-2 text-sm z-[99]`;
    
    toast.innerHTML = `
        <div class="px-1">
            <i class="fa-solid fa-info-circle text-emerald-300"></i>
        </div>
        <div>${message}</div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transition = 'all .2s ease';
        toast.style.opacity = '0';
        
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 180);
    }, 2700);
}

// Show typing indicator
function showTypingIndicator(user) {
    const container = document.getElementById('messages-container');
    if (!container) return;
    
    const existing = document.getElementById('typing-indicator');
    if (existing) existing.remove();
    
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = `flex gap-x-2 px-1`;
    
    typingDiv.innerHTML = `
        <div class="flex-shrink-0">
            <img src="${user.avatar}" class="w-8 h-8 rounded-2xl ring-1 ring-slate-700" alt="">
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
            <div class="px-2 text-xs text-slate-400">${user.name} در حال تایپ...</div>
        </div>
    `;
    
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
    
    setTimeout(() => {
        if (typingDiv && typingDiv.parentNode) {
            typingDiv.parentNode.removeChild(typingDiv);
        }
    }, 6500);
}

// Show user settings modal
function showUserSettings() {
    const modal = document.getElementById('user-settings-modal');
    if (!modal) return;
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    const currentUser = window.ChatData.currentUser;
    
    document.getElementById('modal-username-input').value = currentUser.name;
    document.getElementById('modal-avatar-preview').src = currentUser.avatar;
}

// Hide user settings
function hideUserSettings() {
    const modal = document.getElementById('user-settings-modal');
    if (!modal) return;
    
    modal.classList.remove('flex');
    modal.classList.add('hidden');
}

// Change avatar in modal
function changeAvatar(imgNum) {
    const newAvatar = `https://i.pravatar.cc/36?img=${imgNum}`;
    const preview = document.getElementById('modal-avatar-preview');
    if (preview) {
        preview.src = newAvatar;
        preview.dataset.tempAvatar = newAvatar;
    }
}

// Save user settings
function saveUserSettings() {
    const nameInput = document.getElementById('modal-username-input').value.trim();
    const preview = document.getElementById('modal-avatar-preview');
    
    const updates = {};
    
    if (nameInput) {
        updates.name = nameInput;
    }
    
    if (preview && preview.dataset.tempAvatar) {
        updates.avatar = preview.dataset.tempAvatar;
    }
    
    if (window.ChatData.updateCurrentUser) {
        window.ChatData.updateCurrentUser(updates);
    }
    
    // Update UI
    updateCurrentUserUI();
    
    if (window.ChatUI && window.ChatUI.renderMessages) {
        window.ChatUI.renderMessages();
    }
    
    if (window.ChatUI && window.ChatUI.renderOnlineUsers) {
        window.ChatUI.renderOnlineUsers();
    }
    
    hideUserSettings();
    
    if (window.ChatUI && window.ChatUI.showToast) {
        window.ChatUI.showToast('تنظیمات ذخیره شد!');
    }
}

// Update current user UI
function updateCurrentUserUI() {
    const currentUser = window.ChatData.currentUser;
    
    const usernameEl = document.getElementById('current-username');
    if (usernameEl) usernameEl.innerText = currentUser.name;
    
    const avatarEl = document.getElementById('current-avatar');
    if (avatarEl) avatarEl.src = currentUser.avatar;
    
    const modalPreview = document.getElementById('modal-avatar-preview');
    if (modalPreview) modalPreview.src = currentUser.avatar;
}

// Delete message
function deleteMessage(messageId) {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این پیام را حذف کنید؟')) return;
    
    const room = window.ChatData.getCurrentRoom();
    if (!room) return;
    
    room.messages = room.messages.filter(m => m.id !== messageId);
    window.ChatData.saveToStorage();
    
    if (window.ChatUI && window.ChatUI.renderMessages) {
        window.ChatUI.renderMessages();
    }
}

// Edit message
function editMessage(messageId) {
    const room = window.ChatData.getCurrentRoom();
    if (!room) return;
    
    const message = room.messages.find(m => m.id === messageId);
    if (!message) return;
    
    const newText = prompt('ویرایش پیام:', message.text);
    if (newText === null || newText.trim() === '') return;
    
    message.text = newText.trim();
    
    if (!message.text.includes('(ویرایش شده)')) {
        message.text += ' (ویرایش شده)';
    }
    
    window.ChatData.saveToStorage();
    
    if (window.ChatUI && window.ChatUI.renderMessages) {
        window.ChatUI.renderMessages();
    }
}

// Reply to message
function replyToMessage(messageId) {
    const room = window.ChatData.getCurrentRoom();
    const message = room.messages.find(m => m.id === messageId);
    if (!message) return;
    
    const input = document.getElementById('message-input');
    if (!input) return;
    
    const replyBar = document.createElement('div');
    replyBar.id = 'reply-bar';
    replyBar.className = `flex items-center gap-x-2 mb-2 px-4 py-1 bg-slate-800 border border-slate-700 rounded-2xl mx-1 text-xs`;
    
    replyBar.innerHTML = `
        <div class="flex items-center gap-x-2 flex-1">
            <i class="fa-solid fa-reply text-indigo-300"></i>
            <div class="flex-1">
                <div class="font-semibold text-xs">در حال پاسخ به ${message.userName}</div>
                <div class="text-[10.5px] text-slate-400 truncate">${message.text}</div>
            </div>
        </div>
        
        <button onclick="cancelReply()" class="text-xs px-2 text-slate-400 hover:text-white">لغو</button>
    `;
    
    const inputContainer = input.parentNode;
    inputContainer.parentNode.insertBefore(replyBar, inputContainer);
    
    input.focus();
    input.placeholder = `پاسخ به ${message.userName}...`;
    
    const originalSend = window.sendMessage;
    
    window.sendMessage = function() {
        const val = input.value.trim();
        if (!val) return;
        
        const replyText = `↪ ${message.userName}: ${message.text.substring(0, 35)}${message.text.length > 35 ? '...' : ''}\n${val}`;
        
        if (window.ChatLogic && window.ChatLogic.sendMessage) {
            window.ChatLogic.sendMessage(replyText);
        }
        
        if (replyBar && replyBar.parentNode) replyBar.parentNode.removeChild(replyBar);
        input.placeholder = 'پیام خود را اینجا بنویسید...';
        
        window.sendMessage = originalSend;
        input.value = '';
    };
    
    const origKeyHandler = input.onkeypress;
    input.onkeypress = function(e) {
        if (e.key === 'Enter') {
            window.sendMessage();
            input.onkeypress = origKeyHandler;
        }
    };
}

// Cancel reply
function cancelReply() {
    const replyBar = document.getElementById('reply-bar');
    if (replyBar && replyBar.parentNode) replyBar.parentNode.removeChild(replyBar);
    
    const input = document.getElementById('message-input');
    if (input) {
        input.placeholder = 'پیام خود را اینجا بنویسید...';
    }
}

// React to message
function reactToMessage(messageId, emoji) {
    const room = window.ChatData.getCurrentRoom();
    const message = room.messages.find(m => m.id === messageId);
    if (!message) return;
    
    const msgContainer = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!msgContainer) return;
    
    let reactionEl = msgContainer.querySelector('.reaction-container');
    
    if (!reactionEl) {
        reactionEl = document.createElement('div');
        reactionEl.className = `reaction-container flex items-center gap-1 mt-1 px-1`;
        
        const reactionsDiv = document.createElement('div');
        reactionsDiv.className = `bg-slate-700 px-2 py-[1px] flex items-center rounded-2xl text-xs gap-x-[2px]`;
        
        reactionsDiv.innerHTML = `<span class="px-1">${emoji}</span> <span class="px-[3px] text-[10px] font-medium text-slate-300">1</span>`;
        
        reactionEl.appendChild(reactionsDiv);
        
        const bubble = msgContainer.querySelector('.message-bubble');
        if (bubble) {
            bubble.parentNode.appendChild(reactionEl);
        } else {
            msgContainer.appendChild(reactionEl);
        }
    } else {
        const countSpan = reactionEl.querySelector('.text-slate-300');
        if (countSpan) {
            let count = parseInt(countSpan.innerText) || 1;
            countSpan.innerText = count + 1;
        }
    }
    
    setTimeout(() => {
        if (window.ChatUI && window.ChatUI.showToast) {
            window.ChatUI.showToast('واکنش ثبت شد');
        }
    }, 400);
}

// Search messages
function searchMessages(query) {
    if (window.ChatUI && window.ChatUI.renderMessages) {
        window.ChatUI.renderMessages(query);
    }
}

// Show emoji picker
function showEmojiPicker() {
    const picker = document.getElementById('emoji-picker');
    if (picker) {
        picker.classList.remove('hidden');
        picker.classList.add('flex');
    }
}

// Hide emoji picker
function hideEmojiPicker() {
    const picker = document.getElementById('emoji-picker');
    if (picker) {
        picker.classList.remove('flex');
        picker.classList.add('hidden');
    }
}

// Insert emoji
function insertEmoji(emoji) {
    const input = document.getElementById('message-input');
    if (input) {
        input.value += emoji + ' ';
        hideEmojiPicker();
        input.focus();
    }
}

// Show tips
function showTips() {
    const tipModal = document.createElement('div');
    tipModal.className = `fixed inset-0 bg-black/60 flex items-center justify-center z-[80]`;
    
    tipModal.innerHTML = `
        <div onclick="event.target.remove()" class="bg-slate-900 border border-slate-700 w-full max-w-[310px] rounded-3xl p-6">
            <div class="flex justify-between mb-4">
                <span class="font-bold">نکات استفاده</span>
                <span onclick="this.closest('.fixed').remove()" class="cursor-pointer text-xl leading-none px-1">&times;</span>
            </div>
            
            <div class="text-xs space-y-3 text-slate-300">
                <div class="flex gap-3">
                    <div><i class="fa-solid fa-user text-indigo-300"></i></div>
                    <div>روی نام خود کلیک کنید تا تنظیمات کاربری تغییر کند.</div>
                </div>
                <div class="flex gap-3">
                    <div><i class="fa-solid fa-users text-indigo-300"></i></div>
                    <div>از لیست کاربران آنلاین روی افراد کلیک کنید تا از طرف آن‌ها پیام ارسال شود.</div>
                </div>
                <div class="flex gap-3">
                    <div><i class="fa-solid fa-robot text-indigo-300"></i></div>
                    <div>دکمه شبیه‌سازی پاسخ را فشار دهید تا کاربران دیگر جواب دهند.</div>
                </div>
                <div class="flex gap-3">
                    <div><i class="fa-solid fa-microphone text-indigo-300"></i></div>
                    <div>برای ارسال پیام صوتی روی آیکون میکروفون کلیک کنید.</div>
                </div>
            </div>
            
            <div class="pt-5">
                <button onclick="this.closest('.fixed').remove()" class="text-xs w-full py-[9.5px] bg-slate-800 hover:bg-slate-700 transition-colors rounded-2xl">متوجه شدم</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(tipModal);
}

// Invite users
function inviteUsers() {
    const currentRoom = window.ChatData.currentRoom;
    
    const modal = document.createElement('div');
    modal.className = `fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[70]`;
    
    modal.innerHTML = `
        <div class="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md">
            <div class="flex justify-between mb-4 items-center">
                <div>
                    <span class="font-bold">دعوت از دوستان</span>
                </div>
                <button onclick="this.closest('.fixed').remove()" class="text-slate-400 text-xl px-1">&times;</button>
            </div>
            
            <div class="mb-4">
                <div class="text-xs px-1 mb-1 text-slate-400">لینک دعوت (کپی کنید)</div>
                <div class="flex gap-x-2">
                    <div class="flex-1 bg-slate-800 border border-slate-700 px-3 py-2 text-xs rounded-2xl font-mono truncate">https://chatroom.arena.ai/join/${currentRoom}</div>
                    <button onclick="copyInviteLink(this)" class="px-4 bg-indigo-500 hover:bg-indigo-600 rounded-2xl flex items-center text-xs transition-colors">کپی</button>
                </div>
            </div>
            
            <div>
                <div class="text-xs px-1 mb-2 text-slate-400">دعوت مستقیم:</div>
                
                <div class="space-y-2">
                    <div class="px-3 py-2 flex justify-between items-center hover:bg-slate-800 rounded-2xl cursor-pointer" onclick="inviteSpecificUser('maryam', this)">
                        <div class="flex items-center gap-x-2">
                            <img src="https://i.pravatar.cc/28?img=28" class="w-6 h-6 rounded-full">
                            <span class="text-sm">مریم</span>
                        </div>
                        <span class="text-xs px-2 py-0.5 bg-emerald-800 text-emerald-300 rounded-xl text-center" style="font-size: 9.5px">آنلاین</span>
                    </div>
                    
                    <div class="px-3 py-2 flex justify-between items-center hover:bg-slate-800 rounded-2xl cursor-pointer" onclick="inviteSpecificUser('reza', this)">
                        <div class="flex items-center gap-x-2">
                            <img src="https://i.pravatar.cc/28?img=40" class="w-6 h-6 rounded-full">
                            <span class="text-sm">رضا</span>
                        </div>
                        <span class="text-xs px-2 py-0.5 bg-emerald-800 text-emerald-300 rounded-xl text-center" style="font-size: 9.5px">آنلاین</span>
                    </div>
                </div>
            </div>
            
            <div class="pt-4 flex justify-end">
                <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 text-xs text-slate-300">بستن</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function copyInviteLink(btn) {
    const currentRoom = window.ChatData.currentRoom;
    navigator.clipboard.writeText(`https://chatroom.arena.ai/join/${currentRoom}`).then(() => {
        const origText = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-check"></i> کپی شد`;
        setTimeout(() => {
            if (btn) btn.innerHTML = origText;
            const modal = btn.closest('.fixed');
            if (modal) modal.remove();
        }, 1100);
    });
}

function inviteSpecificUser(userId, element) {
    const users = window.ChatData.users;
    const user = users[userId];
    if (!user) return;
    
    const room = window.ChatData.getCurrentRoom();
    
    element.innerHTML = `<div class="flex items-center gap-x-2"><span class="text-emerald-300 text-xs">در حال پیوستن...</span></div>`;
    
    setTimeout(() => {
        const modal = element.closest('.fixed');
        
        const joinMsg = {
            id: Date.now(),
            userId: user.id,
            userName: user.name,
            avatar: user.avatar,
            text: `به اتاق ${room.name} پیوست!`,
            time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now()
        };
        
        window.ChatData.addMessageToRoom(window.ChatData.currentRoom, joinMsg);
        
        if (users[userId]) users[userId].status = 'online';
        
        window.ChatData.saveToStorage();
        
        if (modal) modal.remove();
        
        if (window.ChatUI && window.ChatUI.renderMessages) {
            window.ChatUI.renderMessages();
        }
        
        if (window.ChatUI && window.ChatUI.renderOnlineUsers) {
            window.ChatUI.renderOnlineUsers();
        }
        
        setTimeout(() => {
            if (window.ChatUI && window.ChatUI.showToast) {
                window.ChatUI.showToast(`${user.name} به اتاق پیوست`);
            }
            
            setTimeout(() => {
                const msg = {
                    id: Date.now(),
                    userId: user.id,
                    userName: user.name,
                    avatar: user.avatar,
                    text: 'سلام همه! خوشحالم که هستم',
                    time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
                    timestamp: Date.now()
                };
                
                window.ChatData.addMessageToRoom(window.ChatData.currentRoom, msg);
                
                if (window.ChatUI && window.ChatUI.renderMessages) {
                    window.ChatUI.renderMessages();
                }
            }, 2200);
        }, 500);
    }, 1250);
}

// Create new room
function createNewRoom() {
    const roomName = prompt('نام اتاق جدید:', 'اتاق جدید');
    if (!roomName) return;
    
    if (window.ChatData.createRoom) {
        const roomId = window.ChatData.createRoom(roomName);
        
        if (window.ChatData.switchToRoom(roomId)) {
            updateRoomHeader();
            renderRoomsList();
            renderMessages();
            
            setTimeout(() => {
                if (window.ChatUI && window.ChatUI.showToast) {
                    window.ChatUI.showToast('اتاق جدید ساخته شد');
                }
            }, 500);
        }
    }
}

// Clear current room
function clearCurrentRoom() {
    if (!confirm('آیا مطمئنید که می‌خواهید تمام پیام‌های این اتاق را پاک کنید؟')) {
        return;
    }
    
    if (window.ChatData.clearRoomMessages) {
        window.ChatData.clearRoomMessages(window.ChatData.currentRoom);
    }
    
    if (window.ChatUI && window.ChatUI.renderMessages) {
        window.ChatUI.renderMessages();
    }
    
    if (window.ChatUI && window.ChatUI.showToast) {
        window.ChatUI.showToast('چت پاک شد');
    }
}

// Export all UI functions
window.ChatUI = {
    renderRoomsList,
    renderOnlineUsers,
    renderMessages,
    updateRoomHeader,
    showToast,
    showTypingIndicator,
    showUserSettings,
    hideUserSettings,
    changeAvatar,
    saveUserSettings,
    updateCurrentUserUI,
    deleteMessage,
    editMessage,
    replyToMessage,
    cancelReply,
    reactToMessage,
    searchMessages,
    showEmojiPicker,
    hideEmojiPicker,
    insertEmoji,
    showTips,
    inviteUsers,
    copyInviteLink,
    inviteSpecificUser,
    createNewRoom,
    clearCurrentRoom
};