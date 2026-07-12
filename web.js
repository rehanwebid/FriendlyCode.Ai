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
let userStatus = 'active';
let currentChatId = 'new';
let currentChatTitle = 'New Chat';
let currentMode = 'ngobrol';

const chatArea = document.getElementById('chatArea');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const tokenDisplay = document.getElementById('tokenCount');
const headerTitle = document.getElementById('headerTitle');
const historyList = document.getElementById('historyList');

// ============================================
// LOAD TOKEN FROM SERVER
// ============================================
async function loadToken() {
    try {
        const response = await fetch(API_URL + '?action=getToken&email=' + userData.email);
        const data = await response.json();
        if (data.status === 'success') {
            tokenCount = data.token;
            userStatus = data.userStatus || 'active';
            updateToken();
            const vipBtn = document.querySelector('.mode-btn[data-mode="vip"]');
            if (vipBtn && userStatus !== 'vip') {
                vipBtn.style.opacity = '0.4';
            }
        }
    } catch (error) {
        console.error('Gagal load token:', error);
    }
}

// ============================================
// LOAD HISTORY FROM SERVER
// ============================================
async function loadHistory() {
    try {
        const response = await fetch(API_URL + '?action=getHistory&email=' + userData.email);
        const data = await response.json();
        if (data.status === 'success' && data.history) {
            historyList.innerHTML = '';
            Object.values(data.history).forEach(chat => {
                addHistoryItem(chat.title, chat.chatId);
            });
        }
    } catch (error) {
        console.error('Gagal load history:', error);
    }
}

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
        if (userStatus !== 'vip') {
            alert('Fitur VIP hanya untuk member! Upgrade ke paket VIP ya.');
            return;
        }
        messageInput.placeholder = 'VIP Mode...';
    }
    checkModeAccess();
}

function checkModeAccess() {
    if (currentMode === 'vip' && userStatus !== 'vip') {
        messageInput.disabled = true;
        sendBtn.disabled = true;
        messageInput.placeholder = 'Upgrade ke VIP...';
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
    
    currentChatId = 'chat_' + Date.now();
    currentChatTitle = 'New Chat';
    updateHeaderTitle();
    messageInput.disabled = false;
    messageInput.placeholder = 'Ngobrol...';
    setMode('ngobrol', document.querySelector('.mode-btn[data-mode="ngobrol"]'));
    checkModeAccess();
}

// ============================================
// LOAD CHAT HISTORY
// ============================================
function loadChat(chatId, title) {
    currentChatId = chatId;
    currentChatTitle = title;
    updateHeaderTitle();
    
    fetch(API_URL + '?action=getHistory&email=' + userData.email)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success' && data.history[chatId]) {
                chatArea.innerHTML = '';
                data.history[chatId].messages.forEach(msg => {
                    addMessage('user', msg.user_message);
                    addMessage('ai', msg.ai_response);
                });
            }
        });
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
// KIRIM PESAN
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
        addHistoryItem(currentChatTitle, currentChatId);
    }

    addMessage('user', message);
    messageInput.value = '';
    autoResize(messageInput);
    sendBtn.disabled = true;

    const loadingMsg = addMessage('ai', '...');
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'chat',
                email: userData.email,
                name: userData.name,
                message: message,
                mode: currentMode,
                chatId: currentChatId
            })
        });
        
        const data = await response.json();
        loadingMsg.remove();
        
        if (data.status === 'success') {
            addMessage('ai', data.response);
            tokenCount = data.token;
            updateToken();
        } else {
            addMessage('ai', '⚠️ ' + data.message);
        }
    } catch (error) {
        loadingMsg.remove();
        addMessage('ai', '❌ Gagal terhubung ke server.');
    }
}

// ============================================
// ADD HISTORY ITEM
// ============================================
function addHistoryItem(title, chatId) {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.textContent = title;
    item.onclick = function() {
        document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active'));
        this.classList.add('active');
        loadChat(chatId, title);
    };
    historyList.insertBefore(item, historyList.firstChild);
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
                const codeId = 'code_' + Math.random().toString(36).substr(2, 9);
                return `
                    <div class="message-code-wrapper">
                        <div class="code-actions">
                            <button class="code-btn" onclick="copyCode('${codeId}')">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                Salin
                            </button>
                            <button class="code-btn" onclick="runCode('${codeId}')">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                Jalankan
                            </button>
                        </div>
                        <pre class="message-code" id="${codeId}">${escapeHtml(part.trim())}</pre>
                    </div>
                `;
            }
            return escapeHtml(part).replace(/\n/g, '<br>');
        }).join('');
    }
    return escapeHtml(text).replace(/\n/g, '<br>');
}

// ============================================
// COPY CODE
// ============================================
function copyCode(codeId) {
    const codeBlock = document.getElementById(codeId);
    const code = codeBlock.textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        const wrapper = codeBlock.parentElement;
        const btn = wrapper.querySelector('.code-btn');
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Tersalin!
        `;
        btn.style.color = '#10B981';
        btn.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        
        setTimeout(() => {
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Salin
            `;
            btn.style.color = '';
            btn.style.borderColor = '';
        }, 2000);
    });
}

// ============================================
// RUN CODE
// ============================================
function runCode(codeId) {
    const codeBlock = document.getElementById(codeId);
    const code = codeBlock.textContent;
    const newWindow = window.open('', '_blank');
    newWindow.document.write(code);
    newWindow.document.close();
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
// INIT
// ============================================
loadToken();
loadHistory();

const style = document.createElement('style');
style.textContent = `@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`;
document.head.appendChild(style);
