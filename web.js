// ============================================
// ⚙️ CONFIG
// ============================================
const API_URL = 'https://script.google.com/macros/s/AKfycbwNJ8E52DLKj10e0kaUDcVASaw2V4uyxsoX9bmfP-ts7jC0lYOlKCyHaBk6SXX537Ukdw/exec';

// ============================================
// LOAD USER DATA
// ============================================
const userData = JSON.parse(localStorage.getItem('friendlyUser') || '{}');

if (userData.name) {
    document.getElementById('sidebarUsername').textContent = userData.name;
    const userPhoto = document.getElementById('userPhoto');
    if (userData.photo) {
        userPhoto.src = userData.photo;
    }
} else {
    window.location.href = 'index.html';
}

// ============================================
// CONFIG
// ============================================
let tokenCount = 3;
let currentChatTitle = 'New Chat';
let currentMode = 'ngobrol';
const chatArea = document.getElementById('chatArea');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const tokenDisplay = document.getElementById('tokenCount');
const headerTitle = document.getElementById('headerTitle');
const welcomeScreen = document.getElementById('welcomeScreen');
const historyList = document.getElementById('historyList');

// ============================================
// MODE SELECTOR
// ============================================
function setMode(mode, btn) {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentMode = mode;
    
    if (mode === 'ngobrol') {
        messageInput.placeholder = 'Ngobrol...';
    } else if (mode === 'ngoding') {
        messageInput.placeholder = 'Minta kode... (1 token)';
    } else if (mode === 'vip') {
        messageInput.placeholder = 'VIP Mode...';
    }
    
    checkModeAccess();
}

function checkModeAccess() {
    if (currentMode === 'vip') {
        messageInput.disabled = false;
        sendBtn.disabled = false;
        messageInput.placeholder = 'VIP Mode...';
    } else if (currentMode === 'ngoding' && tokenCount <= 0) {
        messageInput.disabled = true;
        sendBtn.disabled = true;
        messageInput.placeholder = 'Token habis. Beli token untuk lanjut.';
    } else {
        messageInput.disabled = false;
        sendBtn.disabled = false;
    }
}

// ============================================
// AUTO RESIZE TEXTAREA
// ============================================
function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    sendBtn.disabled = el.value.trim() === '';
}

// ============================================
// HANDLE ENTER
// ============================================
function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        kirimPesan();
    }
}

// ============================================
// ASK SUGGESTION
// ============================================
function askSuggestion(text) {
    messageInput.value = text;
    autoResize(messageInput);
    kirimPesan();
}

// ============================================
// NEW CHAT
// ============================================
function newChat() {
    chatArea.innerHTML = '';
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'welcome';
    welcomeDiv.id = 'welcomeScreen';
    welcomeDiv.innerHTML = `
        <h2>Halo! Ada yang bisa dibantu?</h2>
        <p>Tanya seputar coding, debugging, atau konsep programming.</p>
        <div class="suggestions">
            <button class="suggestion-chip" onclick="askSuggestion('Buatkan navbar responsive dengan HTML CSS')">Buatkan navbar responsive</button>
            <button class="suggestion-chip" onclick="askSuggestion('Jelaskan konsep async/await di JavaScript')">Jelaskan async/await</button>
            <button class="suggestion-chip" onclick="askSuggestion('Debug: TypeError undefined is not a function')">Debug TypeError</button>
            <button class="suggestion-chip" onclick="askSuggestion('Buatkan fungsi fetch API dengan error handling')">Fetch API example</button>
        </div>
    `;
    chatArea.appendChild(welcomeDiv);
    
    tokenCount = 3;
    currentChatTitle = 'New Chat';
    updateToken();
    updateHeaderTitle();
    messageInput.disabled = false;
    messageInput.placeholder = 'Ngobrol...';
    setMode('ngobrol', document.querySelector('.mode-btn[data-mode="ngobrol"]'));
}

// ============================================
// UPDATE TOKEN
// ============================================
function updateToken() {
    const countEl = document.getElementById('tokenCount');
    countEl.textContent = tokenCount;
    
    if (tokenCount <= 0) {
        countEl.classList.add('empty');
        checkModeAccess();
    } else {
        countEl.classList.remove('empty');
    }
}

// ============================================
// UPDATE HEADER TITLE
// ============================================
function updateHeaderTitle() {
    headerTitle.textContent = currentChatTitle;
}

// ============================================
// KIRIM PESAN (DENGAN APPS SCRIPT)
// ============================================
async function kirimPesan() {
    const message = messageInput.value.trim();
    if (!message) return;

    if (currentMode === 'ngoding' && tokenCount <= 0) {
        alert('Token habis! Silakan beli token atau gunakan mode VIP.');
        return;
    }

    const welcome = document.getElementById('welcomeScreen');
    if (welcome) welcome.style.display = 'none';

    if (currentChatTitle === 'New Chat') {
        currentChatTitle = message.substring(0, 40) + (message.length > 40 ? '...' : '');
        updateHeaderTitle();
        addHistoryItem(currentChatTitle);
    }

    addMessage('user', message);
    messageInput.value = '';
    autoResize(messageInput);
    sendBtn.disabled = true;

    // Loading indicator
    const loadingMsg = addMessage('ai', '...');
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'chat',
                email: userData.email,
                name: userData.name,
                message: message,
                mode: currentMode
            })
        });
        
        const data = await response.json();
        
        // Hapus loading
        loadingMsg.remove();
        
        if (data.status === 'success') {
            addMessage('ai', data.response);
            if (currentMode === 'ngoding' || currentMode === 'ngobrol') {
                tokenCount = data.token;
                updateToken();
            }
        } else {
            addMessage('ai', '⚠️ ' + (data.message || 'Gagal dapat respons.'));
        }
    } catch (error) {
        loadingMsg.remove();
        addMessage('ai', '❌ Gagal terhubung ke server. Coba lagi nanti.');
        console.error('Error:', error);
    }
}

// ============================================
// ADD HISTORY ITEM
// ============================================
function addHistoryItem(title) {
    const item = document.createElement('div');
    item.className = 'history-item active';
    item.textContent = title;
    item.onclick = function() {
        document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active'));
        this.classList.add('active');
    };
    historyList.insertBefore(item, historyList.firstChild);
    document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active'));
    item.classList.add('active');
}

// ============================================
// ADD MESSAGE
// ============================================
function addMessage(type, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    
    let avatarHTML = '';
    if (type === 'ai') {
        avatarHTML = '<div class="message-avatar">AI</div>';
    } else {
        if (userData.photo) {
            avatarHTML = `<div class="message-avatar"><img src="${userData.photo}" alt="Profile"></div>`;
        } else {
            avatarHTML = `<div class="message-avatar">${userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}</div>`;
        }
    }
    
    msgDiv.innerHTML = `
        ${avatarHTML}
        <div class="message-content">
            <div class="message-text">${formatText(text)}</div>
        </div>
    `;
    chatArea.appendChild(msgDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
    return msgDiv;
}

// ============================================
// FORMAT TEXT
// ============================================
function formatText(text) {
    if (text === '...') return '<span style="animation:pulse 1s infinite;">Memikirkan...</span>';
    
    if (text.includes('```')) {
        const parts = text.split('```');
        return parts.map((part, i) => {
            if (i % 2 === 1) {
                return `<div class="message-code">${escapeHtml(part.trim())}</div>`;
            }
            return escapeHtml(part).replace(/\n/g, '<br>');
        }).join('');
    }
    return escapeHtml(text).replace(/\n/g, '<br>');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// LOGOUT
// ============================================
function logout() {
    if (confirm('Yakin ingin keluar?')) {
        localStorage.removeItem('friendlyUser');
        window.location.href = 'index.html';
    }
}

// ============================================
// PULSE ANIMATION
// ============================================
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
    }
`;
document.head.appendChild(style);
