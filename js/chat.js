// Chat logic module
// Handles sending messages, simulation, typing, etc.

function sendMessage(text) {
    if (!text || !text.trim()) return;
    
    const roomId = window.ChatData.currentRoom;
    const currentUser = window.ChatData.currentUser;
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    
    const message = {
        id: Date.now(),
        userId: currentUser.id,
        userName: currentUser.name,
        avatar: currentUser.avatar,
        text: text.trim(),
        time: timeStr,
        timestamp: Date.now()
    };
    
    // === REAL SOCKET MODE ===
    if (window.ChatSocket && window.ChatSocket.isConnected && window.ChatSocket.sendRealMessage) {
        const sent = window.ChatSocket.sendRealMessage(roomId, text.trim());
        
        if (sent) {
            // Add locally immediately for instant feedback
            window.ChatData.addMessageToRoom(roomId, message);
            if (window.ChatUI && window.ChatUI.renderMessages) {
                window.ChatUI.renderMessages();
            }
            playSendSound();
            return; // Real message sent to server
        }
    }
    
    // === FALLBACK TO SIMULATION MODE ===
    window.ChatData.addMessageToRoom(roomId, message);
    
    if (window.ChatUI && window.ChatUI.renderMessages) {
        window.ChatUI.renderMessages();
    }
    
    playSendSound();
    
    // Simulate realistic reply (only in simulation mode)
    if (Math.random() > 0.4 && (!window.ChatSocket || !window.ChatSocket.isConnected())) {
        setTimeout(() => {
            simulateReply();
        }, 1250 + Math.random() * 1800);
    }
    
    window.ChatData.saveToStorage();
}

function simulateReply() {
    const room = window.ChatData.getCurrentRoom();
    if (!room) return;
    
    const users = window.ChatData.users;
    const currentUser = window.ChatData.currentUser;
    
    const otherUsers = Object.keys(users).filter(id => id !== currentUser.id);
    const randomUserId = otherUsers[Math.floor(Math.random() * otherUsers.length)];
    const randomUser = users[randomUserId];
    
    let replyTexts = [
        'کاملاً موافقم!',
        'جالب بود، ممنون!',
        'دقیقاً همینطوره 👍',
        'این موضوع رو بیشتر توضیح میدی؟',
        'خنده‌دار بود 😂',
        'منم همین تجربه رو داشتم',
        'آره واقعاً!',
        'عالیه، بگو بیشتر',
        'ممنون از این اطلاعات',
        'درست میگی'
    ];
    
    if (window.ChatData.currentRoom === 'tech') {
        replyTexts = [
            'این ویژگی جدیده، بله خیلی خوبه',
            'من از Tailwind استفاده می‌کنم، تو چی؟',
            'بله، مشکل performance حل شده',
            'منم تست کردم. عالی بود.',
            'منتظر نسخه بعدی هستم'
        ];
    } else if (window.ChatData.currentRoom === 'gaming') {
        replyTexts = [
            'کی میاد بازی؟',
            'منم دارم بازی می‌کنم الان',
            'بازی خیلی خوبیه!',
            'رتبه‌ام بالاست',
            'منتظر آپدیت بعدی هستم'
        ];
    }
    
    const replyText = replyTexts[Math.floor(Math.random() * replyTexts.length)];
    
    // Show typing indicator
    if (window.ChatUI && window.ChatUI.showTypingIndicator) {
        window.ChatUI.showTypingIndicator(randomUser);
    }
    
    setTimeout(() => {
        // Remove typing indicator
        const typingEl = document.getElementById('typing-indicator');
        if (typingEl) typingEl.remove();
        
        // Add the simulated message
        const now = new Date();
        const timeStr = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
        
        const message = {
            id: Date.now(),
            userId: randomUser.id,
            userName: randomUser.name,
            avatar: randomUser.avatar,
            text: replyText,
            time: timeStr,
            timestamp: Date.now()
        };
        
        window.ChatData.addMessageToRoom(window.ChatData.currentRoom, message);
        
        if (window.ChatUI && window.ChatUI.renderMessages) {
            window.ChatUI.renderMessages();
        }
        
        // Chance for a second message
        if (Math.random() > 0.75) {
            setTimeout(() => {
                const secondReplies = ['در ضمن...', 'راستی...', 'یه نکته دیگه هم اینه که...', 'چی فکر می‌کنی؟'];
                const secondText = secondReplies[Math.floor(Math.random() * secondReplies.length)];
                
                const secondMsg = {
                    id: Date.now(),
                    userId: randomUser.id,
                    userName: randomUser.name,
                    avatar: randomUser.avatar,
                    text: secondText,
                    time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
                    timestamp: Date.now()
                };
                
                window.ChatData.addMessageToRoom(window.ChatData.currentRoom, secondMsg);
                
                if (window.ChatUI && window.ChatUI.renderMessages) {
                    window.ChatUI.renderMessages();
                }
            }, 1850);
        }
    }, 1900);
}

function simulateMessageFromUser(userId) {
    const users = window.ChatData.users;
    const user = users[userId];
    if (!user) return;
    
    const sampleTexts = [
        'سلام! چیکار می‌کنی؟',
        'منم همین الان دیدم این خبر رو',
        'عالیه 👍',
        'تو هم موافقی؟',
        'ببینید این پست رو',
        'کی میاد؟',
        'جالبه، بگو بیشتر'
    ];
    
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    
    if (window.ChatUI && window.ChatUI.showTypingIndicator) {
        window.ChatUI.showTypingIndicator(user);
    }
    
    setTimeout(() => {
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
        
        const message = {
            id: Date.now(),
            userId: user.id,
            userName: user.name,
            avatar: user.avatar,
            text: randomText,
            time: timeStr,
            timestamp: Date.now()
        };
        
        window.ChatData.addMessageToRoom(window.ChatData.currentRoom, message);
        
        if (window.ChatUI && window.ChatUI.renderMessages) {
            window.ChatUI.renderMessages();
        }
    }, 1450);
}

function simulateTypingAndReply() {
    const users = window.ChatData.users;
    const currentUser = window.ChatData.currentUser;
    
    const otherUsers = Object.keys(users).filter(id => id !== currentUser.id);
    const randId = otherUsers[Math.floor(Math.random() * otherUsers.length)];
    const randUser = users[randId];
    
    if (window.ChatUI && window.ChatUI.showTypingIndicator) {
        window.ChatUI.showTypingIndicator(randUser);
    }
    
    setTimeout(() => {
        const typingEl = document.getElementById('typing-indicator');
        if (typingEl) typingEl.remove();
        
        const replyOptions = [
            'درست میگی، کاملاً.',
            'منم همین فکر رو می‌کردم.',
            'ممنون که گفتی!',
            'بله، این دقیقاً چیزیه که دنبالش بودم.',
            'خیلی عالیه 😊',
            'چقدر جالب! ادامه بده',
            'من هم موافقم'
        ];
        
        const reply = replyOptions[Math.floor(Math.random() * replyOptions.length)];
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
        
        const message = {
            id: Date.now(),
            userId: randUser.id,
            userName: randUser.name,
            avatar: randUser.avatar,
            text: reply,
            time: timeStr,
            timestamp: Date.now()
        };
        
        window.ChatData.addMessageToRoom(window.ChatData.currentRoom, message);
        
        if (window.ChatUI && window.ChatUI.renderMessages) {
            window.ChatUI.renderMessages();
        }
    }, 2100);
}

function sendVoiceMessage() {
    const container = document.getElementById('messages-container');
    if (!container) return;
    
    const recordDiv = document.createElement('div');
    recordDiv.className = `flex justify-end mb-3 px-2`;
    recordDiv.innerHTML = `
        <div class="max-w-[65%] flex items-center px-3 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-3xl">
            <div class="flex items-center gap-x-3 text-white">
                <div class="flex items-center">
                    <i class="fa-solid fa-microphone text-white animate-pulse"></i>
                    <span class="px-3 text-xs font-semibold">در حال ضبط...</span>
                </div>
                
                <div class="flex items-center gap-x-[2px]">
                    <div class="w-1 h-3 bg-white rounded animate-[pulse_1s_ease-in-out_infinite]"></div>
                    <div class="w-1 h-4 bg-white rounded animate-[pulse_1.2s_ease-in-out_infinite]"></div>
                    <div class="w-1 h-2 bg-white rounded animate-[pulse_0.8s_ease-in-out_infinite]"></div>
                </div>
            </div>
        </div>
    `;
    
    container.appendChild(recordDiv);
    container.scrollTop = container.scrollHeight;
    
    setTimeout(() => {
        if (recordDiv.parentNode) recordDiv.parentNode.removeChild(recordDiv);
        
        const currentUser = window.ChatData.currentUser;
        const now = new Date();
        const timeStr = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
        
        const voiceMsg = {
            id: Date.now(),
            userId: currentUser.id,
            userName: currentUser.name,
            avatar: currentUser.avatar,
            text: `<div class="flex items-center gap-x-2"><i class="fa-solid fa-play text-sm"></i> <span>پیام صوتی</span> <span class="px-2 text-xs font-mono text-indigo-200">0:17</span></div>`,
            time: timeStr,
            timestamp: Date.now()
        };
        
        window.ChatData.addMessageToRoom(window.ChatData.currentRoom, voiceMsg);
        
        if (window.ChatUI && window.ChatUI.renderMessages) {
            window.ChatUI.renderMessages();
        }
        
        setTimeout(() => {
            if (window.ChatUI && window.ChatUI.showToast) {
                window.ChatUI.showToast('پیام صوتی ارسال شد');
            }
            
            if (Math.random() > 0.5) {
                setTimeout(() => {
                    const otherUser = Object.values(window.ChatData.users).filter(u => u.id !== currentUser.id)[0];
                    if (otherUser) {
                        const replyMsg = {
                            id: Date.now(),
                            userId: otherUser.id,
                            userName: otherUser.name,
                            avatar: otherUser.avatar,
                            text: 'صدات خیلی واضحه!',
                            time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
                            timestamp: Date.now()
                        };
                        
                        window.ChatData.addMessageToRoom(window.ChatData.currentRoom, replyMsg);
                        
                        if (window.ChatUI && window.ChatUI.renderMessages) {
                            window.ChatUI.renderMessages();
                        }
                    }
                }, 2300);
            }
        }, 800);
    }, 3200);
}

function attachFile() {
    const input = document.createElement('input');
    input.type = 'file';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const currentUser = window.ChatData.currentUser;
        const now = new Date();
        const timeStr = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
        
        const msgText = `فایل: <span class="font-medium">${file.name}</span> <span class="text-xs text-slate-300">(${Math.round(file.size / 1024)}KB)</span>`;
        
        const newMsg = {
            id: Date.now(),
            userId: currentUser.id,
            userName: currentUser.name,
            avatar: currentUser.avatar,
            text: msgText,
            time: timeStr,
            timestamp: Date.now()
        };
        
        window.ChatData.addMessageToRoom(window.ChatData.currentRoom, newMsg);
        
        if (window.ChatUI && window.ChatUI.renderMessages) {
            window.ChatUI.renderMessages();
        }
        
        setTimeout(() => {
            if (window.ChatUI && window.ChatUI.showToast) {
                window.ChatUI.showToast('فایل آپلود شد (شبیه‌سازی شده)');
            }
        }, 900);
    };
    
    input.click();
}

function playSendSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(720, audioCtx.currentTime);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, audioCtx.currentTime);
        
        gain.gain.value = 0.08;
        
        const duration = 0.09;
        
        oscillator.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        
        oscillator.start();
        
        setTimeout(() => {
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
            oscillator.stop(audioCtx.currentTime + duration + 0.05);
        }, 40);
    } catch(e) {}
}

// Export functions
window.ChatLogic = {
    sendMessage,
    simulateReply,
    simulateMessageFromUser,
    simulateTypingAndReply,
    sendVoiceMessage,
    attachFile,
    playSendSound
};